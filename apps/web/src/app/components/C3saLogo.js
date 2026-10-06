import Image from "next/image";

export default function C3saLogo({ size = 60 }) {
  return (
    <Image
      src="/c3sa-logo.jpeg"
      alt="C3SA logo"
      width={size}
      height={size}
      sizes={`${size}px`}
      style={{
        display: "block",
        flex: "0 0 auto",
        width: size,
        height: size,
        borderRadius: 6,
        backgroundColor: "#fff",
        objectFit: "contain",
      }}
    />
  );
}
