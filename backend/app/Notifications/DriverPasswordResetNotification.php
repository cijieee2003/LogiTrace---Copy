<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DriverPasswordResetNotification extends Notification
{
    use Queueable;

    protected string $username;
    protected string $newPassword;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        string $username,
        string $newPassword
    ) {
        $this->username = $username;
        $this->newPassword = $newPassword;
    }

    /**
     * Notification delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Send the email notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('LogiTrace - Your Password Has Been Reset')
            ->greeting('Hello ' . $this->username . '!')
            ->line('Your LogiTrace password has been reset by an administrator.')
            ->line('You can now use the credentials below to log in:')
            ->line('Username: ' . $this->username)
            ->line('New Password: ' . $this->newPassword)
            ->line('For security, please change your password after logging in.')
            ->line('If you did not expect this password reset, please contact your administrator.')
            ->salutation('Regards, LogiTrace Administration');
    }
}