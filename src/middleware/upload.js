import multer from "multer";


const storage = multer.memoryStorage();


const upload = multer({

    storage,

    limits:{
        fileSize:5 * 1024 * 1024,
        files:1
    },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
            return callback(new Error("Only image files are allowed"));
        }

        callback(null, true);
    }

});

const uploadImage = (fieldNames) => {
    const fields = fieldNames.map((name) => ({ name, maxCount: 1 }));

    return (req, res, next) => {
        upload.fields(fields)(req, res, (error) => {
            if (error) {
                const message = error.code === "LIMIT_UNEXPECTED_FILE"
                    ? `Unexpected image field '${error.field}'. Use one of: ${fieldNames.join(", ")}`
                    : error.message;

                return res.status(400).json({
                    success:false,
                    message
                });
            }

            req.file = fieldNames
                .map((name) => req.files?.[name]?.[0])
                .find(Boolean);

            next();
        });
    };
};


export default upload;
export { uploadImage };
