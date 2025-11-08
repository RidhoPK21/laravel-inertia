<?php

namespace App\Http\Controllers;

use App\Models\Todo; // <-- Tambahkan ini
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function home()
    {
        $auth = Auth::user();
        
        // Ambil semua todos milik user, urutkan berdasarkan yang terbaru
        $todos = Todo::where('user_id', $auth->id)
                    ->orderBy('created_at', 'desc')
                    ->get();

        $data = [
            'auth' => $auth,
            'todos' => $todos, // <-- Kirim todos ke props
        ];
        return Inertia::render('App/HomePage', $data);
    }
}