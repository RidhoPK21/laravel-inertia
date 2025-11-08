import React, { useState } from "react"; // <-- Tambahkan useState
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
import { Check, Trash2, Upload, Edit } from "lucide-react"; // <-- Tambahkan Edit ikon

// Komponen untuk satu item Todo
function TodoItem({ todo }) {
    // State untuk mengontrol mode edit
    const [isEditing, setIsEditing] = useState(false);

    // Form untuk update judul dan deskripsi (menggunakan useForm Inersia)
    const {
        data: editData,
        setData: setEditData,
        patch: patchTodo, // Menggunakan patch untuk update sebagian
        processing: processingEdit,
        errors: editErrors,
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
    } = useForm({
        cover: null,
    });

    // Fungsi untuk mengubah status selesai/belum selesai
    const handleToggleFinished = () => {
        router.patch(
            `/todos/${todo.id}`,
            {
                is_finished: !todo.is_finished,
            },
            {
                preserveScroll: true,
            }
        );
    };

    // Fungsi untuk menghapus todo
    const handleDelete = () => {
        if (confirm("Apakah Anda yakin ingin menghapus todo ini?")) {
            router.delete(`/todos/${todo.id}`);
        }
    };

    // Handler untuk submit cover
    const handleCoverSubmit = (e) => {
        e.preventDefault();
        postCover(`/todos/${todo.id}/cover`, {
            preserveScroll: true,
        });
    };

    // Handler untuk menyimpan perubahan judul/deskripsi
    const handleEditSubmit = (e) => {
        e.preventDefault();
        patchTodo(`/todos/${todo.id}`, {
            onSuccess: () => setIsEditing(false), // Keluar dari mode edit setelah berhasil
            preserveScroll: true,
        });
    };

    return (
        <Card className={todo.is_finished ? "bg-muted/50" : ""}>
            <CardHeader>
                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="space-y-2">
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
                                onClick={() => {
                                    setIsEditing(false); // Batalkan edit
                                    setEditData({
                                        // Reset form ke nilai asli
                                        title: todo.title,
                                        description: todo.description,
                                    });
                                }}
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
                        <CardTitle
                            className={todo.is_finished ? "line-through" : ""}
                        >
                            {todo.title}
                        </CardTitle>
                        <CardDescription
                            className={todo.is_finished ? "line-through" : ""}
                        >
                            {todo.description || "Tidak ada deskripsi."}
                        </CardDescription>
                    </>
                )}
            </CardHeader>
            <CardContent>
                {todo.cover && (
                    <img
                        src={`/storage/${todo.cover}`}
                        alt="Todo Cover"
                        className="mb-4 h-48 w-full rounded-md object-cover"
                    />
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
            <CardFooter className="flex justify-end gap-2">
                {!isEditing && ( // Tombol edit hanya muncul saat tidak dalam mode edit
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(true)}
                        title="Edit Judul & Deskripsi"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    variant={todo.is_finished ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleFinished}
                >
                    <Check className="mr-2 h-4 w-4" />
                    {todo.is_finished ? "Selesai" : "Tandai Selesai"}
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}

// Komponen Halaman Utama (Tidak ada perubahan di sini)
export default function HomePage() {
    // Ambil props 'auth' dan 'todos' yang dikirim dari HomeController
    const { auth, todos } = usePage().props;

    // Form untuk membuat todo baru
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/todos", {
            onSuccess: () => reset(), // Reset form setelah berhasil
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
