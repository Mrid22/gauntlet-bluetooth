import { CommandContext } from "@project-gauntlet/api/helpers";
import { ActionPanel, List } from "@project-gauntlet/api/components";
import { ReactElement } from "react";

export default function View(): ReactElement {
  const command = new Deno.Command("bluetoothctl", {
    args: ["devices", "Paired"],
  });

  const child = command.outputSync();

  const stdout = new TextDecoder().decode(child.stdout);

  console.dir(stdout);

  const filteredLines = stdout
    .split("\n")
    .filter((device) => /Device/.test(device))
    .map((device) => device.replace("Device ", ""));
  const filteredDict: { mac: string; name: string }[] = filteredLines.map(
    (device) => {
      const result: string[] = device.split(" ");
      const mac = result[0];
      const name = result.slice(1).join(" ");
      return { mac, name };
    },
  );
  console.log(filteredDict);

  return (
    <List>
      <List.SearchBar />
    </List>
  );
}
