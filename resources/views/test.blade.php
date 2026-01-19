<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <title>Alarm Data - All Cameras</title>
</head>

<body>
    <div class="container my-5">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0">Alarm Data - All Cameras</h4>
            </div>
            <div class="card-body p-0">
                @if(count($camerasData) > 0)
                    <!-- Tabs Navigation -->
                    <ul class="nav nav-tabs" id="cameraTabs" role="tablist">
                        @foreach($camerasData as $index => $cameraData)
                            <li class="nav-item" role="presentation">
                                <button class="nav-link {{ $index === 0 ? 'active' : '' }}" 
                                        id="tab-{{ $index }}-tab" 
                                        data-bs-toggle="tab" 
                                        data-bs-target="#tab-{{ $index }}" 
                                        type="button" 
                                        role="tab"
                                        aria-controls="tab-{{ $index }}"
                                        aria-selected="{{ $index === 0 ? 'true' : 'false' }}">
                                    {{ $cameraData['cameraName'] }}
                                    <small class="text-muted">({{ count($cameraData['data']) }})</small>
                                </button>
                            </li>
                        @endforeach
                    </ul>

                    <!-- Tabs Content -->
                    <div class="tab-content" id="cameraTabsContent">
                        @foreach($camerasData as $index => $cameraData)
                            <div class="tab-pane fade {{ $index === 0 ? 'show active' : '' }}" 
                                 id="tab-{{ $index }}" 
                                 role="tabpanel" 
                                 aria-labelledby="tab-{{ $index }}-tab">
                                <div class="p-3">
                                    <div class="mb-3">
                                        <span class="badge bg-secondary">Account {{ $cameraData['accountIndex'] }}</span>
                                        <span class="badge bg-info text-dark">Serial: {{ $cameraData['cameraSerial'] }}</span>
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table table-hover table-striped mb-0">
                                            <thead class="table-dark">
                                                <tr>
                                                    <th scope="col" class="text-center">#</th>
                                                    <th scope="col">Alarm ID</th>
                                                    <th scope="col">Alarm Name</th>
                                                    <th scope="col">Date/Time</th>
                                                    <th scope="col">Device Serial</th>
                                                    <th scope="col" class="text-center">Image</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @if(count($cameraData['data']) > 0)
                                                    @foreach($cameraData['data'] as $dataIndex => $data)
                                                    <tr>
                                                        <td class="text-center fw-bold">{{ $dataIndex + 1 }}</td>
                                                        <td>{{ $data['alarmId'] }}</td>
                                                        <td>{{ $data['alarmName'] }}</td>
                                                        <td>
                                                            @if(isset($data['alarmTime']))
                                                                {{ \Carbon\Carbon::createFromTimestamp($data['alarmTime'] / 1000)->format('Y-m-d H:i:s') }}
                                                            @else
                                                                <span class="text-muted">N/A</span>
                                                            @endif
                                                        </td>
                                                        <td><code>{{ $data['deviceSerial'] }}</code></td>
                                                        <td class="text-center">
                                                            <img src="{{ $data['alarmPicUrl'] }}" 
                                                                 alt="Alarm Image" 
                                                                 class="img-thumbnail rounded cursor-pointer" 
                                                                 style="max-width: 120px; max-height: 120px; object-fit: cover; cursor: pointer;"
                                                                 data-bs-toggle="modal"
                                                                 data-bs-target="#imageModal"
                                                                 data-image-url="{{ $data['alarmPicUrl'] }}"
                                                                 data-alarm-name="{{ $data['alarmName'] }}"
                                                                 data-alarm-id="{{ $data['alarmId'] }}"
                                                                 data-alarm-time="{{ isset($data['alarmTime']) ? \Carbon\Carbon::createFromTimestamp($data['alarmTime'] / 1000)->format('Y-m-d H:i:s') : 'N/A' }}">
                                                        </td>
                                                    </tr>
                                                    @endforeach
                                                @else
                                                    <tr>
                                                        <td colspan="6" class="text-center text-muted py-4">
                                                            No alarm data available for this camera
                                                        </td>
                                                    </tr>
                                                @endif
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="p-4 text-center text-muted">
                        No camera data available
                    </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Image Modal -->
    <div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="imageModalLabel">Alarm Image</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <img id="modalImage" src="" alt="Alarm Image" class="img-fluid rounded">
                    <div class="mt-3">
                        <p class="mb-1"><strong>Alarm ID:</strong> <span id="modalAlarmId"></span></p>
                        <p class="mb-1"><strong>Alarm Name:</strong> <span id="modalAlarmName"></span></p>
                        <p class="mb-0"><strong>Date/Time:</strong> <span id="modalAlarmTime"></span></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Modal Image Handler -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const imageModal = document.getElementById('imageModal');
            const modalImage = document.getElementById('modalImage');
            const modalAlarmId = document.getElementById('modalAlarmId');
            const modalAlarmName = document.getElementById('modalAlarmName');
            const modalAlarmTime = document.getElementById('modalAlarmTime');
            const modalTitle = document.getElementById('imageModalLabel');

            imageModal.addEventListener('show.bs.modal', function(event) {
                const button = event.relatedTarget;
                const imageUrl = button.getAttribute('data-image-url');
                const alarmId = button.getAttribute('data-alarm-id');
                const alarmName = button.getAttribute('data-alarm-name');
                const alarmTime = button.getAttribute('data-alarm-time');

                modalImage.src = imageUrl;
                modalAlarmId.textContent = alarmId;
                modalAlarmName.textContent = alarmName;
                modalAlarmTime.textContent = alarmTime || 'N/A';
                modalTitle.textContent = `Alarm Image - ${alarmName}`;
            });
        });
    </script>
</body>

</html>