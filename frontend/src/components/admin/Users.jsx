import { Box, Typography, Button, Stack } from "@mui/material";
import api from "../../api/api";
import { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    api.get("/admin/users").then(res => setUsers(res.data));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUser = async (id, currentDisabled) => {
    const action = currentDisabled ? "enable" : "disable";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    await api.put(`/admin/users/${id}`, { isDisabled: !currentDisabled });
    loadUsers();
  };

  return (
    <Box sx={{ p: 4, bgcolor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ mt: "70px" }} />
      <Typography variant="h4" color="primary.main" fontWeight={800} mb={4}>
        Users
      </Typography>

      {users.map(u => (
        <Stack
          key={u._id}
          direction="row"
          justifyContent="space-between"
          sx={{
            bgcolor: "background.paper",
            p: 2,
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1
          }}
        >
          <Typography color="text.primary">
            {u.email} ({u.role})
          </Typography>

          <Button
            color={u.isDisabled ? "success" : "error"}
            onClick={() => toggleUser(u._id, u.isDisabled)}
          >
            {u.isDisabled ? "Enable" : "Disable"}
          </Button>
        </Stack>
      ))}
    </Box>
  );
}
