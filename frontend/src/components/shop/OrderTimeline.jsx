import { Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import HomeIcon from "@mui/icons-material/Home";

const steps = [
  { key: "placed", label: "Order Placed", icon: CheckCircleIcon },
  { key: "shipped", label: "Shipped", icon: LocalShippingIcon },
  { key: "out_for_delivery", label: "Out for Delivery", icon: DirectionsBikeIcon },
  { key: "delivered", label: "Delivered", icon: HomeIcon }
];

export default function OrderTimeline({ status }) {
  const index = steps.findIndex(s => s.key === status);

  return (
    <Stack spacing={1.5} mt={2}>
      {steps.map((s, i) => {
        const Icon = s.icon;
        const done = i <= index;

        return (
          <Stack key={s.key} direction="row" spacing={2} alignItems="center">
            <Icon sx={{ color: done ? "success.main" : "text.disabled" }} />
            <Typography color={done ? "text.primary" : "text.disabled"}>
              {s.label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
