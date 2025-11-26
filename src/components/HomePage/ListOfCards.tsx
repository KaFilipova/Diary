import Box from "@mui/material/Box";
import CardItem, { type CardItemProps } from "./CardItem";

type ListOfCardsProps = {
  items: CardItemProps[];
};

function ListOfCards({ items }: ListOfCardsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
      }}
    >
      {items.map((item) => (
        <CardItem key={item.to} {...item} />
      ))}
    </Box>
  );
}

export default ListOfCards;
