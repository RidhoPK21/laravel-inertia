import React, { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import {
    Check,
    Trash2,
    Upload,
    Edit,
    ArrowLeft,
    Search,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";
import Chart from "react-apexcharts";

// Komponen untuk satu item Todo
function TodoItem({ todo }) {
    // State untuk mengontrol mode edit judul/deskripsi
    const [isEditing, setIsEditing] = useState(false);
    // State untuk mengontrol mode detail/cover (Tampilan Awal vs Tampilan Detail)
    const [isExpanded, setIsExpanded] = useState(false);

    // Form untuk update judul dan deskripsi
    const {
        data: editData,
        setData: setEditData,
        patch: patchTodo,
        processing: processingEdit,
        errors: editErrors,
        reset: resetEditForm,
    } = useForm({
        title: todo.title,
        description: todo.description,
    });

    // Form untuk update cover
    const {
        data: coverData,
        setData: setCoverData,
        post: postCover,
        processing: processingCover,
        errors: coverErrors,
        reset: resetCoverForm,
    } = useForm({
        cover: null,
    });

    // --- Helper Handlers untuk Stop Propagasi ---
    const stopPropagation = (e) => e.stopPropagation();

    // --- Handlers Aksi ---
    const handleToggleFinished = (e) => {
        stopPropagation(e); // Hentikan event bubble
        router.patch(
            `/todos/${todo.id}`,
            {
                is_finished: !todo.is_finished,
            },
            { preserveScroll: true }
        );
    };

    const handleDelete = (e) => {
        stopPropagation(e); // Hentikan event bubble

        Swal.fire({
            title: "Anda yakin?",
            text: "Todo yang sudah dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                // Kirim request hapus
                router.delete(`/todos/${todo.id}`, {
                    // Tampilkan notifikasi sukses setelah hapus
                    onSuccess: () => {
                        Swal.fire({
                            title: "Berhasil!",
                            text: "Todo telah dihapus.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    },
                });
            }
        });
    };

    const handleCoverSubmit = (e) => {
        e.preventDefault();
        postCover(`/todos/${todo.id}/cover`, {
            preserveScroll: true,
            onSuccess: () => {
                resetCoverForm("cover");
                // Tampilkan toast sukses
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Cover berhasil diupdate!",
                    showConfirmButton: false,
                    timer: 3000,
                });
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        stopPropagation(e); // Hentikan event bubble
        patchTodo(`/todos/${todo.id}`, {
            onSuccess: () => {
                setIsEditing(false);
                // Tampilkan toast sukses
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Todo berhasil diupdate!",
                    showConfirmButton: false,
                    timer: 3000,
                });
            },
            preserveScroll: true,
        });
    };

    const handleCancelEdit = (e) => {
        stopPropagation(e); // Hentikan event bubble
        setIsEditing(false);
        resetEditForm();
    };

    const handleEditClick = (e) => {
        stopPropagation(e); // Hentikan event bubble
        setIsEditing(true);
    };

    // --- TAMPILAN DETAIL (SAAT isExpanded = true) ---
    if (isExpanded) {
        return (
            <Card className={cn(todo.is_finished ? "bg-muted/50" : "")}>
                <CardHeader>
                    <CardTitle>{todo.title}</CardTitle>
                    <CardDescription>Detail Sampul</CardDescription>
                </CardHeader>
                <CardContent>
                    {todo.cover ? (
                        <img
                            src={`/storage/${todo.cover}`}
                            alt="Todo Cover"
                            className="mb-4 h-48 w-full rounded-md object-cover"
                        />
                    ) : (
                        <div className="mb-4 flex h-48 w-full items-center justify-center rounded-md border border-dashed text-muted-foreground">
                            Belum ada sampul.
                        </div>
                    )}
                    <form onSubmit={handleCoverSubmit} className="flex gap-2">
                        <Input
                            type="file"
                            onChange={(e) =>
                                setCoverData("cover", e.target.files[0])
                            }
                        />
                        <Button
                            type="submit"
                            size="icon"
                            variant="outline"
                            disabled={processingCover}
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                    </form>
                    {coverErrors.cover && (
                        <div className="mt-1 text-sm text-red-600">
                            {coverErrors.cover}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-start">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(false)} // Tombol Kembali
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // --- TAMPILAN RINGKAS (SAAT isExpanded = false) ---
    return (
        <Card
            className={cn("py-0", todo.is_finished ? "bg-muted/50" : "")}
            onClick={() => {
                // Hanya bisa expand jika tidak sedang mode edit judul
                if (!isEditing) {
                    setIsExpanded(true);
                }
            }}
        >
            <div
                className={cn(
                    "flex items-center justify-between px-6 py-4",
                    !isEditing &&
                        "cursor-pointer transition-colors hover:bg-accent/50"
                )}
            >
                {isEditing ? (
                    // Form Edit Judul & Deskripsi
                    <form
                        onSubmit={handleEditSubmit}
                        className="w-full space-y-2"
                        onClick={stopPropagation} // Hentikan bubble di form
                    >
                        <Input
                            type="text"
                            value={editData.title}
                            onChange={(e) =>
                                setEditData("title", e.target.value)
                            }
                            className="text-lg font-semibold"
                            placeholder="Judul Todo"
                        />
                        {editErrors.title && (
                            <div className="text-sm text-red-600">
                                {editErrors.title}
                            </div>
                        )}
                        <Input
                            type="text"
                            value={editData.description || ""}
                            onChange={(e) =>
                                setEditData("description", e.target.value)
                            }
                            className="text-muted-foreground"
                            placeholder="Deskripsi Todo"
                        />
                        {editErrors.description && (
                            <div className="text-sm text-red-600">
                                {editErrors.description}
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processingEdit}>
                                {processingEdit ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    // Tampilan Teks Judul & Deskripsi
                    <>
                        {/* Bagian Kiri: Teks */}
                        <div
                            className="flex-1"
                            onClick={(e) => isEditing && stopPropagation(e)}
                        >
                            <CardTitle
                                className={
                                    todo.is_finished ? "line-through" : ""
                                }
                            >
                                {todo.title}
                            </CardTitle>
                            <CardDescription
                                className={
                                    todo.is_finished ? "line-through" : ""
                                }
                            >
                                {todo.description || "Tidak ada deskripsi."}
                            </CardDescription>
                        </div>

                        {/* Bagian Kanan: Tombol Aksi */}
                        <div
                            className="flex shrink-0 items-center gap-2 pl-4"
                            onClick={stopPropagation}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleEditClick} // Handler ini sudah ada stopPropagation
                                title="Edit Judul & Deskripsi"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={
                                    todo.is_finished ? "default" : "outline"
                                }
                                size="sm"
                                onClick={handleToggleFinished} // Handler ini sudah ada stopPropagation
                            >
                                <Check className="mr-2 h-4 w-4" />
                                {todo.is_finished
                                    ? "Selesai"
                                    : "Tandai Selesai"}
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={handleDelete} // Handler ini sudah ada stopPropagation
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}

// Komponen untuk Filter dan Pencarian
function FilterControls({ filters }) {
    // State untuk 'search' (text input)
    const [search, setSearch] = useState(filters.search || "");
    // State untuk 'filter' (tombol aktif)
    const [filter, setFilter] = useState(filters.filter || "all");

    // Kirim request ke server saat state berubah
    useEffect(() => {
        // 'data' adalah parameter query yang akan dikirim
        const data = {};
        if (search) data.search = search;
        if (filter !== "all") data.filter = filter;

        // Gunakan router.get untuk mengunjungi ulang halaman dengan query baru
        router.get(window.location.pathname, data, {
            preserveState: true, // Jaga state komponen (cth: input text tidak hilang)
            replace: true, // Ganti history browser agar tombol back berfungsi normal
            preserveScroll: true, // Jaga posisi scroll
        });
    }, [search, filter]); // Effect ini akan berjalan jika 'search' atau 'filter' berubah

    return (
        <Card className="mb-8 py-0">
            <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                {/* Input Pencarian */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan judul atau deskripsi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {/* Tombol Filter Status */}
                <div className="flex shrink-0 gap-2">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => setFilter("all")}
                        className="flex-1"
                    >
                        Semua
                    </Button>
                    <Button
                        variant={
                            filter === "unfinished" ? "default" : "outline"
                        }
                        onClick={() => setFilter("unfinished")}
                        className="flex-1"
                    >
                        Belum Selesai
                    </Button>
                    <Button
                        variant={
                            filter === "finished" ? "default" : "outline"
                        }
                        onClick={() => setFilter("finished")}
                        className="flex-1"
                    >
                        Selesai
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// --- [PERBAIKAN] Komponen untuk Statistik (ApexCharts) ---
function TodoStats({ stats }) {
    // State untuk memastikan chart hanya dirender di client
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const { total, finished, unfinished } = stats;

    const chartSeries = [finished, unfinished];
    const chartOptions = {
        chart: {
            type: "donut",
        },
        labels: ["Selesai", "Belum Selesai"],
        colors: ["#22c55e", "#ef4444"], // Hijau (Selesai), Merah (Belum)
        legend: {
            position: "bottom",
            // Setel warna teks legenda agar sesuai dengan tema (jika gelap)
            labels: {
                colors: "hsl(var(--foreground))",
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            formatter: () => total,
                        },
                    },
                },
            },
        },
        // Atur warna teks di dalam donut
        dataLabels: {
            enabled: true,
            style: {
                colors: ["#fff", "#fff"], // Teks putih untuk kontras
            },
            dropShadow: {
                enabled: false,
            },
            formatter: (val, opts) => {
                // Tampilkan angka mentah, bukan persentase
                return opts.w.globals.series[opts.seriesIndex];
            },
        },
    };

    return (
        // 1. Hapus padding vertikal dari Card utama
        <Card className="mb-8 py-0"> 
            {/* 2. Kurangi padding di CardHeader */}
            <CardHeader className="p-4 pb-4">
                <CardTitle>Statistik Pekerjaan</CardTitle>
                <CardDescription>
                    Statistik keseluruhan dari semua pekerjaan Anda.
                </CardDescription>
            </CardHeader>
            {/* 3. Kurangi padding di CardContent (Stat Box) */}
            <CardContent className="grid grid-cols-1 gap-4 p-4 pt-0 md:grid-cols-3">
                {/* Stat Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pekerjaan
                        </CardTitle>
                    </CardHeader>
                    {/* 4. Kurangi padding di CardContent internal */}
                    <CardContent className="pt-2">
                        <div className="text-2xl font-bold">{total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Selesai
                        </CardTitle>
                        <Check className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    {/* 4. Kurangi padding di CardContent internal */}
                    <CardContent className="pt-2">
                        <div className="text-2xl font-bold">{finished}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Belum Selesai
                        </CardTitle>
                        <X className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    {/* 4. Kurangi padding di CardContent internal */}
                    <CardContent className="pt-2">
                        <div className="text-2xl font-bold">{unfinished}</div>
                    </CardContent>
                </Card>
            </CardContent>

            {/* Area Chart */}
            {isClient && (
                // 5. Kurangi padding di CardFooter (Chart)
                <CardFooter className="p-4 pt-0">
                    {total > 0 ? (
                        <div className="w-full">
                            <Chart
                                options={chartOptions}
                                series={chartSeries}
                                type="donut"
                                width="100%"
                            />
                        </div>
                    ) : (
                        <div className="w-full py-10 text-center text-muted-foreground">
                            Belum ada data untuk ditampilkan di chart.
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}

// Komponen Halaman Utama
export default function HomePage() {
    // Ambil semua props
    const { auth, todos, filters, stats } = usePage().props;

    // Form untuk tambah todo baru
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/todos", {
            onSuccess: () => {
                reset();
                // Tampilkan toast sukses
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Todo baru berhasil ditambahkan!",
                    showConfirmButton: false,
                    timer: 3000,
                });
            },
            onError: (errors) => {
                if (errors.title || errors.description) {
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "error",
                        title: "Periksa kembali form Anda.",
                        showConfirmButton: false,
                        timer: 3000,
                    });
                }
            },
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    {/* Hero Section */}
                    <div className="mb-12 text-center">
                        <h1 className="mb-4 text-4xl font-bold">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: "&#128075;",
                                }}
                            />
                            Hai! {auth.name}
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Ini adalah daftar pekerjaanmu.
                        </p>
                    </div>

                    {/* Form Tambah Todo */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Tambah Pekerjaan Baru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="title">
                                            Judul
                                        </FieldLabel>
                                        <Input
                                            id="title"
                                            type="text"
                                            placeholder="Apa yang ingin kamu kerjakan?"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                        />
                                        {errors.title && (
                                            <div className="text-sm text-red-600">
                                                {errors.title}
                                            </div>
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="description">
                                            Deskripsi (Opsional)
                                        </FieldLabel>
                                        <Input
                                            id="description"
                                            type="text"
                                            placeholder="Tambahkan detail..."
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.description && (
                                            <div className="text-sm text-red-600">
                                                {errors.description}
                                            </div>
                                        )}
                                    </Field>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Tambah"}
                                    </Button>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Statistik */}
                    <TodoStats stats={stats} />

                    {/* FilterControls */}
                    <FilterControls filters={filters} />

                    {/* Daftar Todos */}
                    <div className="space-y-4">
                        {todos.data.length > 0 ? (
                            todos.data.map((todo) => (
                                <TodoItem key={todo.id} todo={todo} />
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">
                                {filters.search || filters.filter
                                    ? "Todo tidak ditemukan." // Pesan jika ada filter
                                    : "Belum ada pekerjaan."} {/* Pesan jika kosong */}
                            </p>
                        )}
                    </div>

                    {/* Paginasi */}
                    {todos.links.length > 3 && ( // Hanya tampilkan jika ada halaman lain
                        <div className="mt-8 flex justify-center space-x-1">
                            {todos.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || "#"}
                                    preserveScroll
                                    className={cn(
                                        "inline-block rounded-md px-3 py-2 text-sm",
                                        link.active
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card hover:bg-accent",
                                        !link.url
                                            ? "cursor-not-allowed bg-muted text-muted-foreground"
                                            : "border"
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    onClick={(e) =>
                                        !link.url && e.preventDefault()
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}