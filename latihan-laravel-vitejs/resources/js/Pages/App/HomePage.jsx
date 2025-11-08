import React, { useState, useEffect } from "react"; // 1. Tambahkan useEffect
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
import { Check, Trash2, Upload, Edit, ArrowLeft, Search } from "lucide-react"; // 2. Tambahkan ikon Search
import { cn } from "@/lib/utils";

// Komponen TodoItem (TIDAK ADA PERUBAHAN DI SINI)
// ... (Salin seluruh komponen TodoItem dari kode sebelumnya)
function TodoItem({ todo }) {
    // ... (Semua kode di dalam TodoItem tetap sama)
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

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

    const stopPropagation = (e) => e.stopPropagation();

    const handleToggleFinished = (e) => {
        stopPropagation(e);
        router.patch(
            `/todos/${todo.id}`,
            {
                is_finished: !todo.is_finished,
            },
            { preserveScroll: true }
        );
    };

    const handleDelete = (e) => {
        stopPropagation(e);
        if (confirm("Apakah Anda yakin ingin menghapus todo ini?")) {
            router.delete(`/todos/${todo.id}`);
        }
    };

    const handleCoverSubmit = (e) => {
        e.preventDefault();
        postCover(`/todos/${todo.id}/cover`, {
            preserveScroll: true,
            onSuccess: () => resetCoverForm("cover"),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        stopPropagation(e);
        patchTodo(`/todos/${todo.id}`, {
            onSuccess: () => setIsEditing(false),
            preserveScroll: true,
        });
    };

    const handleCancelEdit = (e) => {
        stopPropagation(e);
        setIsEditing(false);
        resetEditForm();
    };

    const handleEditClick = (e) => {
        stopPropagation(e);
        setIsEditing(true);
    };

    if (isExpanded) {
        return (
            <Card className={cn(todo.is_finished ? "bg-muted/50" : "")}>
                {" "}
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
                        onClick={() => setIsExpanded(false)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </CardFooter>
            </Card>
        );
    }
    return (
        <Card
            className={cn("py-0", todo.is_finished ? "bg-muted/50" : "")}
            onClick={() => {
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
                    <form
                        onSubmit={handleEditSubmit}
                        className="w-full space-y-2"
                        onClick={stopPropagation}
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
                    <>
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
                        <div
                            className="flex shrink-0 items-center gap-2 pl-4"
                            onClick={stopPropagation}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleEditClick}
                                title="Edit Judul & Deskripsi"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={
                                    todo.is_finished ? "default" : "outline"
                                }
                                size="sm"
                                onClick={handleToggleFinished}
                            >
                                <Check className="mr-2 h-4 w-4" />
                                {todo.is_finished
                                    ? "Selesai"
                                    : "Tandai Selesai"}
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={handleDelete}
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

// 3. Komponen baru untuk Filter
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
        <Card className="mb-8">
            <CardContent className="flex flex-col gap-4 md:flex-row">
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
                        variant={filter === "finished" ? "default" : "outline"}
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

// Komponen Halaman Utama (Ada PERUBAHAN di sini)
export default function HomePage() {
    // 'todos' adalah objek paginasi, 'filters' adalah objek search & filter
    const { auth, todos, filters } = usePage().props; // 4. Ambil 'filters' dari props

    // Form untuk tambah todo baru (Tidak Berubah)
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/todos", {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    {/* Hero Section (Tidak Berubah) */}
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

                    {/* Form Tambah Todo (Tidak Berubah) */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Tambah Pekerjaan Baru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                {/* ... (Form tambah todo tetap sama) ... */}
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
                                        {processing ? "Menyimpan..." : "Tambah"}
                                    </Button>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>

                    {/* 5. [FITUR BARU] Tambahkan komponen FilterControls di sini */}
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
                                    : "Belum ada pekerjaan."}{" "}
                                {/* Pesan jika kosong */}
                            </p>
                        )}
                    </div>

                    {/* Paginasi (Tidak Berubah) */}
                    {todos.links.length > 3 && (
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
