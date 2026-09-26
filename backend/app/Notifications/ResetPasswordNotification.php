<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable)
    {
        $frontendUrl = env(
            'FRONTEND_URL',
            'http://localhost:5173'
        );

        $url = $frontendUrl
            . '/reset-password/'
            . $this->token
            . '?email='
            . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Reset Your LogiTrace Password')
            ->greeting('Hello!')
            ->line('You are receiving this email because a password reset request was made for your LogiTrace account.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire soon.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}