import React, { useRef, useEffect } from "react";

// Komponen Pembungkus Trix Editor untuk integrasi React/Inertia
export default function TrixEditor({
    name,
    value,
    onChange,
    placeholder = "",
}) {
    const trixRef = useRef(null);

    // 1. Efek untuk menangani event perubahan (trix-change)
    useEffect(() => {
        const editorElement = trixRef.current;

        if (!editorElement) return;

        // Fungsi yang akan dipanggil saat konten Trix berubah
        const handleChange = () => {
            // Ambil nilai (HTML) dari editorElement.value.
            // Trix secara otomatis menyinkronkan kontennya ke value properti dari trix-editor element.
            onChange(editorElement.value);
        };

        // Pasang listener saat konten berubah
        editorElement.addEventListener("trix-change", handleChange);

        // Membersihkan event listener
        return () => {
            editorElement.removeEventListener("trix-change", handleChange);
        };
    }, [onChange]);

    // 2. Efek untuk memuat nilai awal ke editor
    useEffect(() => {
        const editorElement = trixRef.current;

        if (!editorElement) return;

        // Handler untuk memastikan editor sudah siap sebelum memuat konten awal
        const handleInitialize = () => {
            // Memuat konten HTML ke Trix editor
            // Kita hanya memuat initial value di sini (jika ada)
            editorElement.editor.loadHTML(value || "");
        };

        // Pasang listener inisialisasi
        editorElement.addEventListener("trix-initialize", handleInitialize);

        // Jika komponen sudah ada dan Trix sudah terinisialisasi (misal update), panggil manual
        if (editorElement.editor) {
            editorElement.editor.loadHTML(value || "");
        }

        return () => {
            editorElement.removeEventListener(
                "trix-initialize",
                handleInitialize
            );
        };
    }, [value]);

    return (
        <div>
            {/* Input Hidden: Ini adalah input yang akan dikirim ke Laravel, dihubungkan ke trix-editor melalui atribut 'input' */}
            <input type="hidden" id={name} name={name} value={value} />

            {/* Custom Element Trix Editor */}
            <trix-editor
                id={`trix-${name}`}
                ref={trixRef}
                input={name} // Menghubungkan Trix ke input hidden di atas
                placeholder={placeholder}
                // Menambahkan kelas styling
                className="trix-content min-h-32 border border-gray-200 dark:border-gray-800 rounded-md p-3 w-full shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                // ✨ FIX MASALAH BOLD/FORMAT HILANG SETELAH KARAKTER PERTAMA
                data-disable-input-delay
            />
        </div>
    );
}
