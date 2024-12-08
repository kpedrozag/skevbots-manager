"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { getTasks, getBots, createBot } from "@/api";
import type { Task, Bot } from "@/types";

export default function SkevbotsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [createBotError, setCreateBotError] = useState("");
  const queryClient = useQueryClient();

  const tasksQuery = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });

  const botsQuery = useQuery<Bot[]>({
    queryKey: ["bots"],
    queryFn: () => getBots(),
  });

  const busyBotsQuery = useQuery<Bot[]>({
    queryKey: ["busyBots"],
    queryFn: () => getBots(true),
  });

  const createBotMutation = useMutation({
    mutationFn: createBot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["busyBots"] });
      setNewBotName("");
      setCreateBotError("");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      setCreateBotError(error.message);
    },
  });

  const handleCreateBot = () => {
    if (newBotName.trim()) {
      createBotMutation.mutate(newBotName);
    }
  };

  const handleClickAddBot = () => {
    setIsDialogOpen(true);
    setNewBotName("");
    setCreateBotError("");
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-12">Skevbots Manager</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center">
          <AssignmentIcon />
          <span className="pl-2">Available tasks</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tasksQuery.isLoading ? (
            <div>Loading tasks...</div>
          ) : tasksQuery.isError ? (
            <div>Error loading tasks</div>
          ) : (
            tasksQuery.data?.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg text-center hover:bg-muted transition-colors"
              >
                {task.description}
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-2xl font-semibold flex items-center">
              <AssignmentIndIcon />
              <span className="pl-2">Bots</span>
            </CardTitle>
            <Button onClick={handleClickAddBot} className="ml-4">
              Add a bot
            </Button>
          </CardHeader>
          <CardContent>
            {botsQuery.isLoading ? (
              <div>Loading bots...</div>
            ) : botsQuery.isError ? (
              <div>Error loading bots</div>
            ) : botsQuery?.data?.length === 0 ? (
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                Create a bot and assign them tasks
              </div>
            ) : (
              <ul className="space-y-2">
                {botsQuery?.data?.map(({ name }) => (
                  <li key={name} className="p-3 border rounded-lg">
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center">
              <ScheduleIcon />
              <span className="pl-2">Busy bots</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {busyBotsQuery.isLoading ? (
              <div>Loading busy bots...</div>
            ) : busyBotsQuery.isError ? (
              <div>Error loading busy bots</div>
            ) : busyBotsQuery?.data?.length === 0 ? (
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                Bots with tasks assigned will be listed here
              </div>
            ) : (
              <div className="space-y-4">
                {busyBotsQuery?.data?.map((bot) => (
                  <div key={bot.name} className="border rounded-lg p-4">
                    <div className="text-lg font-medium mb-2">{bot.name}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {bot.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-2 bg-muted rounded text-sm"
                        >
                          {task.description}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new bot</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter bot name"
              value={newBotName}
              onChange={(e) => setNewBotName(e.target.value)}
            />
            {createBotError && (
              <div className="bg-red-100 p-4 rounded-lg text-center mt-5">
                {createBotError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateBot}
              disabled={createBotMutation.isPending || !newBotName.trim()}
            >
              {createBotMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
