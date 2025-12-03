import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { shouldMoodRotate, getMoodColor } from "../../utils/moodStorage";

export type CardItemProps = {
  to: string;
  label: string;
  description: string;
  image?: string;
  tooltipText?: string;
  moodName?: string | null;
};

function CardItem({ to, label, description, image, moodName }: CardItemProps) {
  const navigate = useNavigate();
  const shouldRotate = shouldMoodRotate(moodName || null);
  const moodColor = getMoodColor(moodName || null);

  const handleClick = () => {
    navigate(to);
  };

  return (
    <Card
      sx={{
        width: "70%",
        borderRadius: "10px",
        overflow: "hidden",
        transition: "transform 0.3s ease, boxShadow 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 6,
          "& .mood-image": {
            transform: "scale(1.1)",
            ...(shouldRotate
              ? {
                  // For mood-awesome and mood-good: rotation + glow
                  animation:
                    "rotate 3s ease-in-out 1, glow 2s ease-in-out infinite",
                  animationFillMode: "forwards",
                  filter:
                    "drop-shadow(0 0 15px rgba(255, 152, 0, 0.8)) drop-shadow(0 0 25px rgba(255, 193, 7, 0.6))",
                }
              : {
                  // For others: only glow (no rotation) with mood color
                  animation: "glow 2s ease-in-out infinite",
                  filter: `drop-shadow(0 0 15px ${moodColor}) drop-shadow(0 0 25px ${moodColor})`,
                }),
          },
        },
        "@keyframes rotate": {
          "0%": {
            transform: "rotate(0deg) scale(1.1)",
          },
          "100%": {
            transform: "rotate(360deg) scale(1.1)",
          },
        },
        "@keyframes glow": {
          "0%, 100%": {
            opacity: 1,
          },
          "50%": {
            opacity: 0.8,
          },
        },
      }}
      onClick={handleClick}
    >
      <CardActionArea>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: 2,
          }}
        >
          {image && (
            <CardMedia
              component="img"
              sx={{
                width: 80,
                height: 80,
                objectFit: "contain",
                flexShrink: 0,
                transition: "transform 0.6s ease, filter 0.6s ease",
                filter: "drop-shadow(0 0 6px rgba(255, 193, 7, 0.3))",
              }}
              image={image}
              alt={label}
              className="mood-image"
            />
          )}
          <CardContent sx={{ flex: 1, padding: "0 !important" }}>
            <Typography gutterBottom variant="h5" component="div">
              {label}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {description}
            </Typography>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default CardItem;
