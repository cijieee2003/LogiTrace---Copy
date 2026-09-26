<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class DriverVerificationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $temporaryPassword
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1(
                    $notifiable->getEmailForVerification()
                ),
            ]
        );

        return (new MailMessage)
            ->subject('LogiTrace Driver Account Verification')
            ->greeting('Welcome to LogiTrace!')
            ->line(
                'An administrator has created a driver account for you.'
            )
            ->line('Your login credentials are:')
            ->line(
                'Username: ' . $notifiable->username
            )
            ->line(
                'Temporary Password: ' . $this->temporaryPassword
            )
            ->line(
                'Please verify your email address before logging in.'
            )
            ->action(
                'Verify Email Address',
                $verificationUrl
            )
            ->line(
                'After verification, you will be automatically logged in.'
            )
            ->line(
                'For security, please change your password after logging in.'
            );
    }
}