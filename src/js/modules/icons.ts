import {
    createIcons,
    Clock,
    PictureInPicture,
    User,
    Settings,
    SkipForward,
    Hourglass,
    Plus,
    X,
    Bot,
    Volume2,
    Palette,
    CloudUpload,
} from 'lucide';

export function refreshIcons(): void {
    createIcons({
        icons: {
            Clock,
            PictureInPicture,
            User,
            Settings,
            SkipForward,
            Hourglass,
            Plus,
            X,
            Bot,
            Volume2,
            Palette,
            CloudUpload,
        },
    });
}
