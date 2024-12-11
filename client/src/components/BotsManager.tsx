"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useWebSocket from "react-use-websocket";

import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

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

import {
  getTasks,
  getBots,
  createBot,
  scheduleTasks,
  getCompletedTasks,
  resetEntities,
} from "@/api";
import type { Task, Bot, CompletedTasks } from "@/types";

export default function SkevbotsManager() {
  const [isAddBotDialogOpen, setIsAddBotDialogOpen] = useState(false);
  const [isAssignTasksDialogOpen, setIsAssignTasksDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [createBotError, setCreateBotError] = useState("");
  const [selectedBot, setSelectedBot] = useState<Omit<Bot, "tasks">>();
  const [firstTask, setFirstTask] = useState("");
  const [secondTask, setSecondTask] = useState("");
  const [shouldListen, setShouldListen] = useState(false);
  const [showSyncIcon, setShowSyncIcon] = useState(false);
  const queryClient = useQueryClient();

  const tasksQuery = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });

  const completedTasksQuery = useQuery<CompletedTasks[]>({
    queryKey: ["completed-tasks"],
    queryFn: getCompletedTasks,
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
      queryClient.invalidateQueries({ queryKey: ["completed-tasks"] });
      setSelectedBot({} as Bot);
      setFirstTask("");
      setSecondTask("");
      setIsAssignTasksDialogOpen(false);
      setShouldListen(true);
      setShowSyncIcon(true);
    },
  });

  const resetEntitiesMutation = useMutation({
    mutationFn: resetEntities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["busyBots"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["completed-tasks"] });
      setSelectedBot({} as Bot);
      setFirstTask("");
      setSecondTask("");
      setShouldListen(false);
      setShowSyncIcon(false);
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
      tasksQuery.refetch().then((tasks) => {
        completedTasksQuery.refetch().then(() => {
          if (
            // shouldListen &&
            tasks.data?.some((t) => !t.expiresAt || tasks.data.length === 0)
          ) {
            setShouldListen(false);
            setShowSyncIcon(false);
          }
        });
      });
    }
  }, [lastMessage, tasksQuery, completedTasksQuery]);

  // useEffect(() => {
  //   if (shouldListen && tasksQuery.data?.every((t) => !t.expiresAt)) {
  //     setShouldListen(false);
  //   }
  // }, [shouldListen, tasksQuery]);

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

      {showSyncIcon && (
        <div className="flex flex-row-reverse items-center">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <div className="p-5">Syncing...</div>
        </div>
      )}

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
            All tasks are completed! Well done.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center">
          <AssignmentTurnedInIcon />
          <span className="pl-2">Completed tasks</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {completedTasksQuery.isLoading ? (
            <div>Loading tasks...</div>
          ) : completedTasksQuery.isError ? (
            <div>Error loading completed tasks</div>
          ) : (
            completedTasksQuery.data?.map((task) => (
              <div
                key={`ctli_${task.taskId}`}
                className={
                  "p-4 border rounded-lg text-center transition-colors"
                }
              >
                {task.description}
              </div>
            ))
          )}
        </div>
        {completedTasksQuery?.data?.length === 0 && (
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            Tasks completed will show up here!
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

      {tasksQuery.data?.length === 0 &&
        (completedTasksQuery?.data?.length || 0) >= 0 && (
          <Button
            variant={"destructive"}
            onClick={() => {
              resetEntitiesMutation.mutate();
            }}
          >
            Reset
          </Button>
        )}

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
              maxLength={30}
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
            {tasksQuery?.data?.filter((t) => !t.expiresAt)?.length === 0 ? (
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                No tasks to assign this time
              </div>
            ) : (
              <>
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
                    {tasksQuery.data
                      ?.filter((t) => !t.expiresAt)
                      .map((task, index) => (
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
                          ?.filter(
                            (ts) => ts._id !== firstTask && !ts.expiresAt
                          )
                          .map((task, index) => (
                            <SelectItem key={`o2_t${index}`} value={task._id}>
                              {task.description}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
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
