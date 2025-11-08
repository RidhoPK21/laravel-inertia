import React, { useState } from "react";
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
import { useForm, usePage, router } from "@inertiajs/react";
import { Check, Trash2, Upload, Edit, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils"; // <-- 1. Tambahkan import 'cn'

// Komponen untuk satu item Todo
function TodoItem({ todo }) {
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

    // --- TAMPILAN DETAIL (SAAT isExpanded = true) ---
    // (Tidak ada perubahan di blok ini)
    if (isExpanded) {
        return (
            <Card className={cn(todo.is_finished ? "bg-muted/50" : "")}>
                {" "}
                {/* Pastikan cn dipakai di sini juga */}
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

    // --- TAMPILAN RINGKAS (SAAT isExpanded = false) ---
    return (
        <Card
            // 2. Gunakan 'cn' dan override padding vertikal ('py-0')
            className={cn(
                "py-0", // <-- Hapus padding vertikal default Card
                todo.is_finished ? "bg-muted/50" : ""
            )}
            onClick={() => {
                if (!isEditing) {
                    setIsExpanded(true);
                }
            }}
        >
            <div
                className={cn(
                    // 3. Atur padding vertikal ('py-4') & horizontal ('px-6') di sini
                    "flex items-center justify-between px-6 py-4",
                    !isEditing &&
                        "cursor-pointer transition-colors hover:bg-accent/50"
                )}
            >
                {isEditing ? (
                    // Form Edit
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
                    // Tampilan Teks & Tombol Aksi
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

// Komponen Halaman Utama (Tidak ada perubahan di sini)
export default function HomePage() {
    // ... (sisa kode sama)
    const { auth, todos } = usePage().props;

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
                                        {processing ? "Menyimpan..." : "Tambah"}
                                    </Button>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Daftar Todos */}
                    <div className="space-y-4">
                        {todos.length > 0 ? (
                            todos.map((todo) => (
                                <TodoItem key={todo.id} todo={todo} />
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">
                                Belum ada pekerjaan.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
