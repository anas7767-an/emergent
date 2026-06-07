import { getCategoryEmoji, getProductTileBg } from "@/lib/product-visuals";

interface ProductTileProps {
  productId: number;
  category?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: { tile: "text-4xl", radius: "rounded-xl" },
  md: { tile: "text-6xl sm:text-7xl", radius: "" },
  lg: { tile: "text-7xl sm:text-8xl", radius: "" },
} as const;

/**
 * Renders a category-based emoji icon on a clean colored background (navy or
 * light grey). Used in place of stock-photo product images everywhere.
 */
export function ProductTile({ productId, category, size = "md", className = "" }: ProductTileProps) {
  const emoji = getCategoryEmoji(category);
  const { bg, variant } = getProductTileBg(productId);
  const sz = SIZE[size];
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${bg} ${sz.radius} ${className}`}
      data-testid={`product-tile-${productId}`}
    >
      {/* Soft accent blob in navy variant only */}
      {variant === "navy" && (
        <>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#FFD700]/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </>
      )}
      <span
        className={`relative leading-none select-none ${sz.tile} ${
          variant === "navy" ? "drop-shadow-[0_4px_18px_rgba(255,215,0,0.35)]" : ""
        }`}
        role="img"
        aria-label={category || "product"}
      >
        {emoji}
      </span>
    </div>
  );
}
