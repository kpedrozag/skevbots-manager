"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useWebSocket from "react-use-websocket";

import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getTasks, getBots, createBot, scheduleTasks } from "@/api";
import type { Task, Bot } from "@/types";

export default function SkevbotsManager() {
  const [isAddBotDialogOpen, setIsAddBotDialogOpen] = useState(false);
  const [isAssignTasksDialogOpen, setIsAssignTasksDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [createBotError, setCreateBotError] = useState("");
  const [selectedBot, setSelectedBot] = useState<Omit<Bot, "tasks">>();
  const [firstTask, setFirstTask] = useState("");
  const [secondTask, setSecondTask] = useState("");
  const [shouldListen, setShouldListen] = useState(false);
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
      setIsAddBotDialogOpen(false);
    },
    onError: (error) => {
      setCreateBotError(error.message);
    },
  });

  const AssignTasksMutation = useMutation({
    mutationFn: scheduleTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["busyBots"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setSelectedBot({} as Bot);
      setFirstTask("");
      setSecondTask("");
      setIsAssignTasksDialogOpen(false);
      setShouldListen(true);
    },
  });

  const { sendMessage, lastMessage } = useWebSocket<string>(
    import.meta.env.VITE_WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    if (shouldListen) {
      sendMessage("START");
    }
  }, [shouldListen, sendMessage]);

  useEffect(() => {
    const { data } = (lastMessage as { data: string }) || {};
    if (data === "UPDATE_TASKS") {
      tasksQuery.refetch();
    }
  }, [lastMessage, tasksQuery]);

  useEffect(() => {
    if (shouldListen && tasksQuery.data?.every((t) => !t.expiresAt)) {
      setShouldListen(false);
    }
  }, [shouldListen, tasksQuery]);

  const handleCreateBot = () => {
    if (newBotName.trim()) {
      createBotMutation.mutate(newBotName);
    }
  };

  const handleClickAddBot = () => {
    setIsAddBotDialogOpen(true);
    setNewBotName("");
    setCreateBotError("");
  };

  const handleClickAssignTasks = (_id: string, name: string) => {
    setSelectedBot({ _id, name });
    setIsAssignTasksDialogOpen(true);
    setFirstTask("");
    setSecondTask("");
  };

  const handleClickSubmitAssignTasks = () => {
    if (selectedBot?._id) {
      AssignTasksMutation.mutate({
        botId: selectedBot?._id,
        tasks: [firstTask, secondTask],
      });
    } else {
      throw new Error("Bot not selected");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-12">Skevbots Manager</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center">
          <AssignmentIcon />
          <span className="pl-2">Tasks list</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tasksQuery.isLoading ? (
            <div>Loading tasks...</div>
          ) : tasksQuery.isError ? (
            <div>Error loading tasks</div>
          ) : (
            tasksQuery.data?.map((task) => (
              <div
                key={`tli_${task._id}`}
                className={
                  "p-4 border rounded-lg text-center transition-colors"
                }
              >
                {task.description}
                <br />
                {task.expiresAt && (
                  <span className="bg-yellow-200">
                    {"("}Task in progress{")"}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        {tasksQuery?.data?.length === 0 && (
          <div className="bg-green-100 p-4 rounded-lg text-center">
            Tasks completed!
          </div>
        )}
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
                {botsQuery?.data?.map(({ name, tasks, _id }) => (
                  <li
                    key={`bli_${_id}`}
                    className="p-3 border rounded-lg flex justify-between items-baseline"
                  >
                    {name}
                    {tasks.length === 0 && (
                      <Button onClick={() => handleClickAssignTasks(_id, name)}>
                        Assign tasks
                      </Button>
                    )}
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
                  <div
                    key={`bbsi_${bot._id}`}
                    className="border rounded-lg p-4"
                  >
                    <div className="text-lg font-medium mb-2 text-center">
                      {bot.name}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {bot.tasks.map((task) => {
                        const jsFormattedDate = new Date(
                          task.endsAt
                        ).toLocaleString();

                        return (
                          <div
                            key={`tbsi_${task._id}`}
                            className="p-2 bg-muted rounded text-sm"
                          >
                            <b>Task</b>: {task.description}. <br />
                            <b>Ends at</b>: {jsFormattedDate}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddBotDialogOpen} onOpenChange={setIsAddBotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new bot</DialogTitle>
            <DialogDescription>
              Enter the name of new Bot and click {`"Save"`}
            </DialogDescription>
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

      <Dialog
        open={isAssignTasksDialogOpen}
        onOpenChange={setIsAssignTasksDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign tasks to the Bot: {selectedBot?.name}
            </DialogTitle>
            <DialogDescription>
              Select the tasks you want to assign and click {`"Assign"`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              onValueChange={(value) => {
                setFirstTask(value);
                // setSecondTask("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick first task" />
              </SelectTrigger>
              <SelectContent>
                {tasksQuery.data?.map((task, index) => (
                  <SelectItem
                    key={`o1_t${index}`}
                    value={task._id}
                    disabled={task._id === secondTask}
                  >
                    {task.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {firstTask && (
              <div className="mt-5">
                <Select
                  onValueChange={(value) => {
                    setSecondTask(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pick second task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasksQuery.data
                      ?.filter((ts) => ts._id !== firstTask)
                      .map((task, index) => (
                        <SelectItem key={`o2_t${index}`} value={task._id}>
                          {task.description}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleClickSubmitAssignTasks}
              disabled={
                AssignTasksMutation.isPending || !(firstTask && secondTask)
              }
            >
              {AssignTasksMutation.isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
