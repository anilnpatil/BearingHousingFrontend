# Angular Service Control Component

## Overview
The Angular Service Control component provides a user-friendly interface to manage the Angular application service directly from the admin panel. It includes:

- **Service Status Display**: Real-time status indicator showing if the service is running or stopped
- **Service Controls**: Buttons to start, stop, and restart the Angular service
- **QR Code Generator**: Generates a QR code containing the Angular app URL for easy mobile access
- **IP Address Display**: Shows the PC's IP address and full Angular URL
- **Auto-refresh**: Status automatically updates every 10 seconds

## Features

### 1. Service Status
- Displays current service status (Running/Stopped)
- Visual indicator with pulsing animation
- Auto-refresh every 10 seconds
- Manual refresh option

### 2. Service Controls
- **Start Service**: Launches the Angular service
- **Stop Service**: Gracefully stops the running service
- **Restart Service**: Restarts the service
- **Refresh Status**: Manually refresh the current status

### 3. QR Code
- Generate QR code pointing to the Angular application URL
- Display the full URL for reference
- Network connectivity warning
- Regenerate QR code option

### 4. Error Handling
- Clear error messages for failed operations
- Timeout protection (20-second timeout for all operations)
- User-friendly alerts and notifications
- Success confirmation messages

## Architecture

### Files Created

```
BearingHousingFrontend/src/app/
├── core/services/
│   └── angular-service.service.ts          # Backend API service
├── features/admin/
│   └── angular-service-control/
│       ├── angular-service-control.component.ts        # Component logic
│       ├── angular-service-control.component.html      # Template
│       ├── angular-service-control.component.scss      # Styles
│       └── angular-service-control.component.spec.ts   # Unit tests
```

## Backend Integration

The component communicates with the backend controller: `AngularServiceController.java`

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/angular/status` | GET | Get current service status |
| `/api/angular/start` | POST | Start the service |
| `/api/angular/stop` | POST | Stop the service |
| `/api/angular/restart` | POST | Restart the service |
| `/api/angular/qr` | GET | Generate QR code with URL |

### Response Format

All endpoints return a standardized response:

```json
{
  "success": true,
  "message": "Operation successful",
  "command": "start",
  "exitCode": 0,
  "ip": "192.168.1.100",
  "port": 4200,
  "url": "https://192.168.1.100:4200",
  "qrCode": "data:image/png;base64,...",
  "warning": "Network warning message"
}
```

## Usage

### For Admin Users
1. Navigate to the Admin panel
2. Scroll down to the "Angular Service Control" section
3. View the current service status
4. Use the control buttons to manage the service
5. Scan the QR code with a mobile device to access the Angular app

### For Integration
The component is automatically integrated into the Admin panel. It's imported and declared in `admin.ts`:

```typescript
import { AngularServiceControlComponent } from './angular-service-control/angular-service-control.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RegisterComponent, 
    AngularServiceControlComponent
  ],
  // ...
})
export class Admin implements OnInit { }
```

## Component Signals (Reactive State)

The component uses Angular Signals for reactive state management:

```typescript
// Status and QR Code
status = signal<string>('Unknown');          // Current service status
isRunning = signal<boolean>(false);           // Service running flag
qrCode = signal<string | null>(null);         // QR code image data
angularUrl = signal<string | null>(null);     // Full Angular URL
pcIp = signal<string | null>(null);           // PC IP address

// UI States
isLoading = signal<boolean>(false);           // Status loading flag
isLoadingQr = signal<boolean>(false);         // QR code loading flag
error = signal<string | null>(null);          // Error message
successMessage = signal<string | null>(null); // Success message
isExecuting = signal<boolean>(false);         // Command execution flag
```

## Key Methods

### `loadStatus(): void`
- Fetches and updates the service status
- Called on component initialization
- Called every 10 seconds (auto-refresh)
- Called after command execution

### `loadQrCode(): void`
- Generates a new QR code for the Angular URL
- Extracts IP address and URL information
- Called on component initialization

### `startService() | stopService() | restartService(): void`
- Executes the respective command
- Manages loading and error states
- Refreshes status after successful execution

### `executeCommand(command, commandFunction): void`
- Private method handling all command execution
- Manages loading, error, and success states
- Provides unified error handling

## Styling

The component uses SCSS with:
- Gradient backgrounds for modern UI
- Smooth animations and transitions
- Responsive design (mobile-friendly)
- Color-coded alerts (red for errors, green for success)
- Animated status indicator with pulsing effect
- Disabled button states to prevent multiple submissions

### Key CSS Classes
- `.angular-service-control`: Main container
- `.service-card`: Card container
- `.status-box`: Status display box
- `.buttons-grid`: Control buttons grid
- `.qr-container`: QR code display area
- `.alert`: Alert/message container

## Error Handling

The component handles various error scenarios:

1. **Connection Errors**: Service unavailable or network issues
2. **Timeout Errors**: Command execution timeout (20 seconds)
3. **Command Errors**: Invalid command or execution failure
4. **QR Generation Errors**: Unable to generate QR code

All errors are displayed to the user with:
- Clear error message
- Dismiss button
- Color-coded alert styling (red background)

## Security Considerations

The component:
- Uses only predefined endpoints from the backend
- Relies on Angular's HTTP client for request handling
- Uses token-based authentication (inherited from AuthService)
- Respects role-based access control (Admin only)
- Has timeout protection on all requests

## Testing

Unit tests are provided in `angular-service-control.component.spec.ts`:

```bash
# Run tests
ng test

# Run tests with coverage
ng test --code-coverage
```

Test coverage includes:
- Component initialization
- Status loading
- Service state changes
- Error handling
- QR code generation
- Command execution

## Performance Considerations

1. **Auto-refresh**: Status updates every 10 seconds (configurable in `ngOnInit`)
2. **Timeout Protection**: 20-second timeout on all HTTP requests
3. **Signal-based Reactivity**: Efficient change detection
4. **Lazy Loading**: Component loads only when admin navigates to Admin panel

## Future Enhancements

Possible improvements:
1. Add service logs viewing capability
2. Implement real-time WebSocket updates instead of polling
3. Add service restart scheduling
4. Include service performance metrics
5. Add email notifications for service status changes
6. Implement service health check with detailed diagnostics

## Troubleshooting

### QR Code Not Displaying
- Ensure the backend is running on port 8083
- Check that WinSW service is properly configured
- Verify network connectivity

### Service Commands Not Working
- Check if WinSW executable path is correct in backend
- Verify Windows service is installed
- Check user permissions for service management

### Timeout Errors
- Service command taking too long
- Increase `COMMAND_TIMEOUT_SECONDS` in backend (currently 15 seconds)
- Check system resource usage

### Network Issues
- Ensure PC and mobile are on the same network
- Check firewall settings on PC
- Verify port 4200 is accessible

## Browser Compatibility

Tested and supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Same as the main application.
