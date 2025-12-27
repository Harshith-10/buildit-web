"use client";

import { format } from "date-fns";
import { Calendar, Eye, Folder, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataItemsView } from "@/components/common/data-items/data-items-root";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePageName } from "@/hooks/use-page-name";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  public: boolean | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionsViewProps {
  data: Collection[];
  total: number;
}

export function CollectionsView({ data, total }: CollectionsViewProps) {
  usePageName("Collections");
  const router = useRouter();

  const columns = [
    {
      header: "Name",
      accessorKey: "name" as keyof Collection,
      className: "font-medium",
    },
    {
      header: "Visibility",
      accessorKey: (item: Collection) =>
        item.public ? (
          <Badge variant="secondary">Public</Badge>
        ) : (
          <Badge variant="outline">Private</Badge>
        ),
    },
    {
      header: "Created At",
      accessorKey: (item: Collection) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(item.createdAt, "MMM d, yyyy")}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: (item: Collection) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/collections/${item.id}`}
                className="flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" /> View Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]",
    },
  ];

  const renderCard = (item: Collection) => (
    <div className="flex flex-col h-full border rounded-xl p-6 hover:border-primary/50 transition-colors bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Folder className="h-6 w-6 text-primary" />
        </div>
        {item.public ? (
          <Badge variant="secondary">Public</Badge>
        ) : (
          <Badge variant="outline">Private</Badge>
        )}
      </div>

      <h3 className="text-xl font-bold mb-2 line-clamp-1">{item.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
        {item.description || "No description"}
      </p>

      <div className="text-xs text-muted-foreground mb-4">
        Created {format(item.createdAt, "MMM d, yyyy")}
      </div>

      <div className="mt-auto pt-4 border-t w-full">
        <Button asChild className="w-full gap-2">
          <Link href={`/collections/${item.id}`}>View Collection</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <DataItemsView
      title="Collections"
      description="Manage and view your problem collections."
      data={data}
      totalItems={total}
      columns={columns}
      renderCard={renderCard}
      defaultView="card"
      availableViews={["card", "table"]}
      filters={[
        {
          label: "Visibility",
          key: "visibility",
          options: [
            { label: "Public", value: "public" },
            { label: "Private", value: "private" },
          ],
        },
      ]}
      sortOptions={[
        { label: "Newest Created", value: "created-desc" },
        { label: "Oldest Created", value: "created-asc" },
        { label: "Name (A-Z)", value: "name-asc" },
        { label: "Name (Z-A)", value: "name-desc" },
      ]}
      createAction={{
        label: "New Collection",
        onClick: () => {
          router.push("/collections/create");
        },
      }}
    />
  );
}
