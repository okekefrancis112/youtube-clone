import z from "zod";
import { ResponsiveModal } from "@/components/responsive-dialog";
import { trpc } from "@/trpc/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlaylistCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
    name: z.string().min(1),
})

export const PlaylistCreateModal = ({
    open,
    onOpenChange,
}: ThumbnailGenerateModalProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    });

    const utils = trpc.useUtils();

    const create = trpc.playlists.create.useMutation({
        onSuccess: () => {
            form.reset();
            onOpenChange(false);
            toast.success("Playlist created");
            utils.playlists.getMany.invalidate();
        },
        onError: () => {
            toast.error("Something went wrong");
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        create.mutate(values);
    };

    return (
        <ResponsiveModal
            title="Create a playlist"
            open={open}
            onOpenChange={onOpenChange}
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="My favourite videos"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end mt-4">
                        <Button
                            type="submit"
                            disabled={create.isPending}
                        >
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    );
};