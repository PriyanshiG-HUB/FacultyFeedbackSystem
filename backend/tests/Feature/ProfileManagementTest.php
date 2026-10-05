<?php

namespace Tests\Feature;

use App\Models\UserAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileManagementTest extends TestCase
{
    public function test_authenticated_user_can_get_profile(): void
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'admin@college.edu');
    }

    public function test_user_can_update_profile_details(): void
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/profile', [
                'full_name' => 'System Administrator Updated',
                'email' => 'admin_updated@college.edu',
                'mobile' => '9988776655',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'admin_updated@college.edu')
            ->assertJsonPath('user.full_name', 'System Administrator Updated');

        $this->assertDatabaseHas('user_account', [
            'id' => $user->id,
            'email' => 'admin_updated@college.edu',
        ]);

        // Revert back so database seeder state remains consistent for other tests
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/profile', [
                'full_name' => 'System Administrator',
                'email' => 'admin@college.edu',
                'mobile' => '9876543210',
            ]);
    }

    public function test_user_cannot_change_password_with_incorrect_current_password(): void
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/profile/password', [
                'current_password' => 'wrongpassword123',
                'new_password' => 'newSecret123',
                'new_password_confirmation' => 'newSecret123',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_user_can_change_password(): void
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/profile/password', [
                'current_password' => 'password123',
                'new_password' => 'newAdminPassword123',
                'new_password_confirmation' => 'newAdminPassword123',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Password updated successfully.');

        // Verify login works with new password
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'admin@college.edu',
            'password' => 'newAdminPassword123',
        ]);
        $loginResponse->assertStatus(200);

        // Reset password back to password123 for other tests
        $user->fresh();
        $user->password_hash = Hash::make('password123');
        $user->save();
    }
}
