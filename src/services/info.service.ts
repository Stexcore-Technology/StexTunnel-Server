import { Service } from "@stexcore/api-engine";
import fs from "fs";

/**
 * Information server service
 */
export default class InfoService extends Service {

    /**
     * Get information server
     */
    public GetInformationServer() {
        // Read package.json information
        const data = JSON.parse(
            fs.readFileSync("package.json").toString()
        );

        // Get information server
        return {
            server_name: data.name,
            version: data.version,
            uptime: this.getUptime()
        };
    }

    /**
     * Get uptime server
     * @returns Uptime text information
     */
    private getUptime() {
        // Get uptime miliseconds
        const uptimeInSeconds = process.uptime();

        // Get uptime text
        if (uptimeInSeconds < 60) {
            return `Uptime ${Math.floor(uptimeInSeconds)} sec`;
        } else if (uptimeInSeconds < 3600) {
            return `Uptime ${Math.floor(uptimeInSeconds / 60)} min`;
        } else if (uptimeInSeconds < 86400) {
            return `Uptime ${Math.floor(uptimeInSeconds / 3600)} hours`;
        } else {
            return `Uptime ${Math.floor(uptimeInSeconds / 86400)} days`;
        }
    }
    
}