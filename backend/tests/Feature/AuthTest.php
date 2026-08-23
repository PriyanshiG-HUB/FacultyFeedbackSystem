<?php

namespace Tests\Feature;

use App\Models\UserAccount;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@college.edu',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'token_type',
                'user' => ['id', 'email', 'role', 'status'],
            ]);
    }

    public function test_login_with_invalid_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@college.edu',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_auth_me_endpoint(): void
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'admin@college.edu');
    }

    public function test_logout_endpoint(): void
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200);
    }
}
