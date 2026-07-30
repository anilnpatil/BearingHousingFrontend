import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { RegisterComponent } from '../../auth/register/register.component';
import { User } from '../../auth/models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RegisterComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  // User Management
  users = signal<User[]>([]);
  isLoadingUsers = signal(false);
  userError = signal<string | null>(null);

  // Register New User
  showRegisterForm = signal(false);
  registrationSuccess = signal<string | null>(null);

  // Delete Confirmation
  userToDelete = signal<User | null>(null);
  isDeleting = signal(false);
  deleteError = signal<string | null>(null);

  // Sorting and Filtering
  sortBy = signal<'username' | 'role' | 'id'>('id');
  filterRole = signal<'ALL' | 'ADMIN' | 'USER'>('ALL');

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ============ USER LISTING ============

  /** Load all users from backend  */
  loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.userError.set(null);

    this.authService.getAllUsers().subscribe({
      next: (response) => {
        const userList = response.data || [];
        this.users.set(userList);
        this.isLoadingUsers.set(false);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        const errorMsg = this.extractErrorMessage(error);
        this.userError.set(errorMsg || 'Failed to load users. Please try again.');
        this.isLoadingUsers.set(false);
      }
    });
  }

  /** Get filtered and sorted users */
  getFilteredUsers(): User[] {
    let filtered = this.users();

    if (this.filterRole() !== 'ALL') {
      filtered = filtered.filter(u => u.role === this.filterRole());
    }

    return filtered.sort((a, b) => {
      const sortField = this.sortBy();
      if (sortField === 'username') {
        return a.username.localeCompare(b.username);
      } else if (sortField === 'role') {
        return a.role.localeCompare(b.role);
      } else {
        return (a.id ?? 0) - (b.id ?? 0);
      }
    });
  }

  // ============ USER DELETION ============

  /** Initiate delete user with confirmation */
  initiateDeleteUser(user: User): void {
    this.userToDelete.set(user);
  }

  /** Cancel delete operation */
  cancelDelete(): void {
    this.userToDelete.set(null);
    this.deleteError.set(null);
  }

  /** Confirm and delete user */
  confirmDeleteUser(): void {
    const user = this.userToDelete();
    if (!user || !user.id) return;

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.authService.deleteUser(user.id).subscribe({
      next: () => {
        // Remove user from list
        const currentUsers = this.users();
        this.users.set(currentUsers.filter(u => u.id !== user.id));
        this.userToDelete.set(null);
        this.isDeleting.set(false);
        // Refresh list to ensure sync with backend
        setTimeout(() => this.loadUsers(), 500);
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        const errorMsg = this.extractErrorMessage(error);
        this.deleteError.set(errorMsg || 'Failed to delete user. Please try again.');
        this.isDeleting.set(false);
      }
    });
  }

  // ============ USER REGISTRATION ============

  /** Toggle register form visibility */
  toggleRegisterForm(): void {
    this.showRegisterForm.update(v => !v);
  }

  /** Handle successful registration from RegisterComponent */
  onRegistrationSuccess(event: { username: string }): void {
    // Show success message
    this.registrationSuccess.set(`User '${event.username}' registered successfully!`);
    
    // Hide form and return to user list after 2 seconds
    setTimeout(() => {
      this.showRegisterForm.set(false);
      this.registrationSuccess.set(null);
      this.loadUsers();
    }, 2000);
  }

  // ============ UTILITY METHODS ============

  /** Extract error message from HTTP error response */
  private extractErrorMessage(error: any): string {
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.error) {
      return error.error.error;
    }
    if (error.statusText) {
      return error.statusText;
    }
    return '';
  }

  /** Get role badge color */
  getRoleColor(role: string): string {
    return role === 'ADMIN' ? 'badge-admin' : 'badge-user';
  }

  /** Format date string  */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }
}
