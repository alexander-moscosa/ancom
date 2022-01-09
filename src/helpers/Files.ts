import fs from 'fs';

class Files {

    public static readFile( path: string ): string {
        try {
            const data = fs.readFileSync(path, 'utf-8');
            return data;
        } catch ( err: any ) {
            throw new Error(err);
        }
    }

    public static writeFile<T extends object>( path: string, data: T ):void {

        const dataToSave: string = JSON.stringify(data);

        try {
            fs.writeFileSync(path, dataToSave);
        } catch ( err: any ) {
            throw new Error(err);
        }
    }

}

export default Files;