<?php

namespace App\Http\Controllers\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pegawai;
use App\Models\Giatbid;

class Analytics extends Controller
{
  public function index()
  {
    $totalPegawai = Pegawai::where('status_pegawai', 'Aktif')->count();
    $totalGiatbid = Giatbid::whereYear('tgl_kegiatan', 2025)->count();


    // Variabel ini wajib ada untuk template
    $pageConfigs = ['myLayout' => 'vertical'];

    return view('content.dashboard.dashboards-analytics', ['pageConfigs' => $pageConfigs], compact(
      'totalPegawai',
      'totalGiatbid'
    ));
  }
}
