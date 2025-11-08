<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request; // <-- 1. Import Request
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    // 2. Tambahkan 'Request $request' sebagai parameter
    public function home(Request $request)
    {
        $auth = Auth::user();

        // 3. Ambil parameter 'search' dan 'filter' dari request
        $search = $request->input('search');
        $filter = $request->input('filter');

        $todos = Todo::where('user_id', $auth->id)
            ->orderBy('created_at', 'desc')
            // 4. Tambahkan logic untuk PENCARIAN
            ->when($search, function ($query, $search) {
                // Cari di kolom 'title' atau 'description'
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            // 5. Tambahkan logic untuk FILTER
            ->when($filter, function ($query, $filter) {
                if ($filter === 'finished') {
                    $query->where('is_finished', true);
                } elseif ($filter === 'unfinished') {
                    $query->where('is_finished', false);
                }
                // Jika filter == 'all', tidak perlu query tambahan
            })
            ->paginate(20)
            ->withQueryString(); // withQueryString penting agar paginasi tetap membawa filter

        $data = [
            'auth' => $auth,
            'todos' => $todos,
            // 6. Kirimkan kembali nilai filter ke props
            'filters' => [
                'search' => $search,
                'filter' => $filter,
            ]
        ];
        return Inertia::render('App/HomePage', $data);
    }
}