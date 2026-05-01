import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(180deg, #0f172a 0%, #312e81 18%, #6d28d9 38%, #db2777 58%, #f97316 78%, #fde68a 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 25,
            bottom: -40,
            width: 130,
            height: 130,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, #fffbeb 0%, #fde68a 45%, #fbbf24 80%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
