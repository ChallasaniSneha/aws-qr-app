import QRCode from "qrcode";
import AWS from "aws-sdk";

const s3 = new AWS.S3();

export const handler = async (event) => {
    try {

        const body = JSON.parse(event.body);

        const text = body.text;

        if (!text) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Text is required"
                })
            };
        }

        // Generate QR Code as base64
        const qrImage = await QRCode.toDataURL(text);

        // Convert base64 to buffer
        const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");

        const buffer = Buffer.from(base64Data, "base64");

        const fileName = `qr-${Date.now()}.png`;

        const params = {
            Bucket: "sneha-qr-502761807358-ap-south-1-an",
            Key: fileName,
            Body: buffer,
            ContentType: "image/png"
        };

        await s3.upload(params).promise();

        const imageUrl = `https://${params.Bucket}.s3.amazonaws.com/${fileName}`;

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                imageUrl
            })
        };

    } catch (error) {

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};

