import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Select value={i18n.language} onValueChange={(val) => i18n.changeLanguage(val)}>
      <SelectTrigger className="w-[120px] h-9 bg-background/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Language" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ru">Русский</SelectItem>
        <SelectItem value="uz">O'zbek</SelectItem>
      </SelectContent>
    </Select>
  );
}
