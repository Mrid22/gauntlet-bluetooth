import { showHud } from "@project-gauntlet/api/helpers";
import { ActionPanel, List } from "@project-gauntlet/api/components";
import { ReactElement, useState } from "react";

export default function View(): ReactElement {
  const [searchText, setSearchText] = useState<string | undefined>("");
  const pairedDevicescmd = new Deno.Command("bluetoothctl", {
    args: ["devices", "Paired"],
  });

  const child = pairedDevicescmd.outputSync();

  const pairedDevicesout = new TextDecoder().decode(child.stdout);

  const connectedDevicescmd = new Deno.Command("bluetoothctl", {
    args: ["devices", "Connected"],
  });

  const connectedchild = connectedDevicescmd.outputSync();
  const connectedout = new TextDecoder().decode(connectedchild.stdout);

  const filteredLines = pairedDevicesout
    .split("\n")
    .filter((device) => /Device/.test(device))
    .map((device) => device.replace("Device ", ""));

  const searchLines = searchText
    ? filteredLines.filter((items) =>
        items.toLowerCase().includes(searchText.toLowerCase()),
      )
    : filteredLines;

  const filteredDict: {
    mac: string;
    name: string;
    connection_status: string;
  }[] = searchLines.map((device) => {
    const result: string[] = device.split(" ");
    const mac = result[0];
    const name = result.slice(1).join(" ");
    let connection_status: string = "";

    if (connectedout.includes(name)) {
      connection_status = "Connected";
    } else {
      connection_status = "Disconnected";
    }
    return { mac, name, connection_status };
  });

  let items = filteredDict.map((device, index: number) => (
    <List.Item
      id={device.mac}
      key={index}
      title={device.name}
      subtitle={device.connection_status}
    ></List.Item>
  ));

  return (
    <List
      actions={
        <ActionPanel title="Actions">
          <ActionPanel.Action
            label="Connect/Disconnect Device"
            onAction={async (id: string | undefined) => {
              if (id) {
                if (connectedout.includes(id)) {
                  const command = new Deno.Command("bluetoothctl", {
                    args: ["disconnect", id ?? ""],
                  });
                  const child = command.outputSync();
                  const stdout = new TextDecoder().decode(child.stdout);
                  if (stdout.includes("Disconnection successful")) {
                    showHud("Disconnected Successfully");
                  } else {
                    showHud("Disconnection Failed");
                  }
                } else {
                  const command = new Deno.Command("bluetoothctl", {
                    args: ["connect", id ?? ""],
                  });
                  const child = command.outputSync();
                  const stdout = new TextDecoder().decode(child.stdout);
                  if (stdout.includes("Failed to Connect")) {
                    showHud("Connection Failed");
                  } else {
                    showHud("Connected Successfully");
                  }
                }
              }
            }}
          />
        </ActionPanel>
      }
    >
      <List.SearchBar
        placeholder="Search Paired Devices"
        value={searchText}
        onChange={setSearchText}
      />
      {items}
    </List>
  );
}
