import { jsx, jsxs } from 'react/jsx-runtime';
import { showHud } from '@project-gauntlet/api/helpers';
import { List, ActionPanel } from '@project-gauntlet/api/components';
import { useState } from 'react';

function View() {
    const [searchText, setSearchText] = useState("");
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
        ? filteredLines.filter((items) => items.toLowerCase().includes(searchText.toLowerCase()))
        : filteredLines;
    const filteredDict = searchLines.map((device) => {
        const result = device.split(" ");
        const mac = result[0];
        const name = result.slice(1).join(" ");
        let connection_status = "";
        if (connectedout.includes(name)) {
            connection_status = "Connected";
        }
        else {
            connection_status = "Disconnected";
        }
        return { mac, name, connection_status };
    });
    let items = filteredDict.map((device, index) => (jsx(List.Item, { id: device.mac, title: device.name, subtitle: device.connection_status }, index)));
    return (jsxs(List, { actions: jsx(ActionPanel, { title: "Actions", children: jsx(ActionPanel.Action, { label: "Connect/Disconnect Device", onAction: async (id) => {
                    if (id) {
                        if (connectedout.includes(id)) {
                            const command = new Deno.Command("bluetoothctl", {
                                args: ["disconnect", id ?? ""],
                            });
                            const child = command.outputSync();
                            const stdout = new TextDecoder().decode(child.stdout);
                            if (stdout.includes("Disconnection successful")) {
                                showHud("Disconnected Successfully");
                            }
                            else {
                                showHud("Disconnection Failed");
                            }
                        }
                        else {
                            const command = new Deno.Command("bluetoothctl", {
                                args: ["connect", id ?? ""],
                            });
                            const child = command.outputSync();
                            const stdout = new TextDecoder().decode(child.stdout);
                            if (stdout.includes("Failed to Connect")) {
                                showHud("Connection Failed");
                            }
                            else {
                                showHud("Connected Successfully");
                            }
                        }
                    }
                } }) }), children: [jsx(List.SearchBar, { placeholder: "Search Paired Devices", value: searchText, onChange: setSearchText }), items] }));
}

export { View as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUtdmlldy5qcyIsInNvdXJjZXMiOltdLCJzb3VyY2VzQ29udGVudCI6W10sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
