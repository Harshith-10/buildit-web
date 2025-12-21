import Image from "next/image";

interface LogoProps {
  imagePath?: string;
  className?: string;
}

export default function Logo({
  imagePath = "/buildit-logo.png",
  className,
}: LogoProps) {
  return (
    <Image
      src={imagePath}
      alt="Buildit Logo"
      width={100}
      height={100}
      className={className}
    />
  );
}
