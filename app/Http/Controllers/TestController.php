<?php

namespace App\Http\Controllers;

use App\Models\VehicleLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TestController extends Controller
{
    public function index()
    {
        // Account and camera configuration
        $accounts = [
            [
                'token' => 'at.07fae19g3g5k3v96cypgd0oubcczoo8p-2vf906tt60-0lopwv6-quegkza2t',
                'cameras' => [
                    ['serial' => 'BG5031825', 'name' => 'Camera 1'],
                    ['serial' => 'BG3012633', 'name' => 'Camera 2'],
                    ['serial' => 'BG3012721', 'name' => 'Camera 3'],
                    ['serial' => 'BG3012674', 'name' => 'Camera 4'],
                ]
            ],
            [
                'token' => 'at.dk8bot166uq3hc4tc56sggelbqo305jp-8z712my0c2-06m2jqf-0dpj7rg8l',
                'cameras' => [
                    ['serial' => 'BG5031807', 'name' => 'Camera 5'],
                    ['serial' => 'BG3012625', 'name' => 'Camera 6'],
                    ['serial' => 'BG3012630', 'name' => 'Camera 7'],
                ]
            ]
        ];

        $allData = [];

        foreach ($accounts as $accountIndex => $account) {
            foreach ($account['cameras'] as $camera) {
                $url = 'https://isgpopen.ezvizlife.com/api/lapp/alarm/device/list?accessToken=' . 
                       urlencode($account['token']) . 
                       '&deviceSerial=' . urlencode($camera['serial']) . 
                       '&pageSize=50';

                try {
                    $response = Http::withOptions([
                        'verify' => false,
                    ])->post($url);

                    /** @var \Illuminate\Http\Client\Response $response */
                    $responseData = $response->status() === 200 ? ($response->json() ?? []) : [];
                } catch (\Exception $e) {
                    $responseData = [];
                }
                
                $allData[] = [
                    'accountIndex' => $accountIndex + 1,
                    'cameraName' => $camera['name'],
                    'cameraSerial' => $camera['serial'],
                    'data' => $responseData['data'] ?? [],
                    'response' => $responseData
                ];
            }
        }

        return view('test', [
            'camerasData' => $allData
        ]);
    }
}
