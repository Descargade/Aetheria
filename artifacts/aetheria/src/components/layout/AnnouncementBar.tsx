import { useQuery } from "@tanstack/react-query";

interface BannerItem {
  id: number;
  text: string;
  sortOrder: number;
  active: boolean;
}

export function AnnouncementBar() {
  const { data: items } = useQuery<BannerItem[]>({
    queryKey: ["banner-items"],
    queryFn: async () => {
      const res = await fetch("/api/banner/active");
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (!items || items.length === 0) return null;

  const bannerText = items.map((i) => i.text).join(" | ");

  return (
    <div className="bg-primary text-primary-foreground text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em] h-8 flex items-center justify-center text-center px-4 overflow-hidden">
      <span className="animate-marquee whitespace-nowrap">
        {bannerText}
      </span>
    </div>
  );
}
