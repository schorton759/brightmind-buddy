
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  age_group: z.string({
    required_error: "Please select an age group.",
  }),
});

type AddChildFormProps = {
  onComplete: () => void;
};

const AddChildForm = ({ onComplete }: AddChildFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      age_group: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to create a child profile.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting child profile creation with values:", values);
      
      // Prepare request payload
      const payload = {
        username: values.username,
        age_group: values.age_group,
        parent_id: user.id,
      };
      
      console.log("Sending payload to edge function:", payload);
      
      // Call the Supabase Edge Function to create the child profile
      const { data, error } = await supabase.functions.invoke('create-child-profile', {
        body: payload,
      });
      
      console.log("Edge function response:", { data, error });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to create child profile: ${error.message}`);
      }
      
      if (data && data.error) {
        console.error('Edge function returned error:', data.error);
        throw new Error(`Failed to create child profile: ${data.error}`);
      }
      
      console.log('Child profile created successfully:', data);

      toast({
        title: "Child profile created",
        description: `${values.username}'s profile has been created successfully.`,
      });

      onComplete();
    } catch (error: any) {
      console.error('Error creating child profile:', error.message);
      toast({
        variant: "destructive",
        title: "Failed to create child profile",
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your child's name" {...field} />
              </FormControl>
              <FormDescription>
                This is how your child will be identified in the app.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age_group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age Group</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="8-10">8-10 years</SelectItem>
                  <SelectItem value="10-12">10-12 years</SelectItem>
                  <SelectItem value="13-15">13-15 years</SelectItem>
                  <SelectItem value="15+">15+ years</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The age group helps us provide age-appropriate content.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onComplete} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Child Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddChildForm;
