<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class TodoController extends Controller
{
    /**
     * Simpan todo baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Auth::user()->todos()->create([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return redirect()->route('home')->with('success', 'Todo berhasil ditambahkan!');
    }

    /**
     * Update todo.
     */
    public function update(Request $request, Todo $todo)
    {
        // Otorisasi: Pastikan user hanya bisa update todo miliknya
        if ($todo->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'is_finished' => 'sometimes|required|boolean',
        ]);

        $todo->update($request->all());

        return back();
    }

    /**
     * Hapus todo.
     */
    public function destroy(Todo $todo)
    {
        // Otorisasi: Pastikan user hanya bisa hapus todo miliknya
        if ($todo->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Hapus file cover jika ada
        if ($todo->cover) {
            Storage::disk('public')->delete($todo->cover);
        }

        $todo->delete();

        return redirect()->route('home')->with('success', 'Todo berhasil dihapus!');
    }

    /**
     * Update cover todo.
     */
    public function updateCover(Request $request, Todo $todo)
    {
        // Otorisasi: Pastikan user hanya bisa update todo miliknya
        if ($todo->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'cover' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048', // maks 2MB
        ]);

        // Hapus cover lama jika ada
        if ($todo->cover) {
            Storage::disk('public')->delete($todo->cover);
        }

        // Simpan cover baru
        $path = $request->file('cover')->store('covers', 'public');

        $todo->update([
            'cover' => $path,
        ]);

        return back()->with('success', 'Cover berhasil diupdate!');
    }
}