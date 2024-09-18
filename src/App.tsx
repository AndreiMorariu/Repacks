import { useState, useEffect } from "react";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/ui/mode-toggle";

import IGame from "./interfaces/IGame";
import data from "../data.json";

const games: IGame[] = data;

const genres: string[] = Array.from(
	new Set(games.map((game) => game.genres.toLowerCase().split(", ")).flat())
).filter((str) => str !== "2014" && str !== "");

const frequencyMap: { [key: string]: number } = genres.reduce(
	(acc: { [key: string]: number }, val: string) => {
		acc[val] = (acc[val] || 0) + 1;
		return acc;
	},
	{}
);

const sortedByFrequency = Object.entries(frequencyMap).sort(
	(a, b) => b[1] - a[1]
);

const tags = sortedByFrequency
	.slice(0, sortedByFrequency.length)
	.map((entry) => entry[0]);

export default function App() {
	const [sortBy, setSortBy] = useState<string>("comments-desc");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [tagSearchQuery, setTagSearchQuery] = useState<string>("");
	const [pageInputValue, setPageInputValue] = useState<string>("");
	const gamesPerPage: number = 12;

	useEffect(() => {
		window.scrollTo({ top: 0 });
	}, [currentPage]);

	const filteredGames = games.filter(
		(game) =>
			(selectedTags.length === 0 ||
				selectedTags.every((tag) => game.genres.toLowerCase().includes(tag))) &&
			(searchQuery
				? game.title.toLowerCase().includes(searchQuery.toLowerCase())
				: true)
	);

	const sortedGames = [...filteredGames].sort((a, b) => {
		if (sortBy === "comments-asc") return a.comments - b.comments;
		if (sortBy === "comments-desc") return b.comments - a.comments;
		return 0;
	});

	const indexOfLastGame = currentPage * gamesPerPage;
	const indexOfFirstGame = indexOfLastGame - gamesPerPage;
	const currentGames = sortedGames.slice(indexOfFirstGame, indexOfLastGame);

	const filteredTags = tags.filter((tag) =>
		tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
	);

	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

	const totalPages = Math.ceil(sortedGames.length / gamesPerPage);

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedTags, searchQuery, sortBy]);

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	function handlePageInputSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const pageNumber = parseInt(pageInputValue, 10);
		if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages)
			setCurrentPage(pageNumber);
		else setPageInputValue("");
	}

	const getPageNumbers = () => {
		const pageNumbers = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i);
			}
		} else {
			pageNumbers.push(1);

			let startPage = Math.max(
				currentPage - Math.floor((maxPagesToShow - 2) / 2),
				2
			);

			const endPage = Math.min(startPage + maxPagesToShow - 3, totalPages - 1);

			if (endPage - startPage < maxPagesToShow - 3) {
				startPage = Math.max(endPage - (maxPagesToShow - 3) + 1, 2);
			}

			if (startPage > 2) {
				pageNumbers.push("...");
			}

			for (let i = startPage; i <= endPage; i++) {
				pageNumbers.push(i);
			}

			if (endPage < totalPages - 1) {
				pageNumbers.push("...");
			}

			pageNumbers.push(totalPages);
		}

		return pageNumbers;
	};

	return (
		<ThemeProvider>
			<div className="container mx-auto px-4 py-8">
				<header className="text-center mb-8 flex justify-between items-center">
					<h1 className="text-4xl font-bold">FitGirl Repacks</h1>
					<div className="flex items-center gap-6">
						<h2 className="text-xl font-semibold">
							{games.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
							Repacks
						</h2>
						<ModeToggle />
					</div>
				</header>

				<div className="flex flex-col-reverse lg:flex-row gap-8">
					<aside className="lg:w-64 flex-shrink-0">
						<div className="bg-primary-foreground p-4 rounded-lg shadow-md">
							<h2 className="text-xl font-semibold mb-4">Tags</h2>
							<div className="mb-4">
								<div className="relative">
									<Input
										id="tag-search"
										type="search"
										placeholder="Search tags..."
										className="w-full pl-10"
										value={tagSearchQuery}
										onChange={(e) => setTagSearchQuery(e.target.value)}
									/>
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
								</div>
							</div>
							<div className="max-h-96 overflow-y-auto pr-2">
								{filteredTags.map((tag) => (
									<div key={tag} className="flex items-center space-x-2 mb-2">
										<Checkbox
											id={`tag-${tag}`}
											checked={selectedTags.includes(tag)}
											onCheckedChange={() => toggleTag(tag)}
										/>
										<label
											htmlFor={`tag-${tag}`}
											className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{tag}
										</label>
									</div>
								))}
							</div>
						</div>
						<Button
							className="mt-6"
							onClick={() => {
								setTagSearchQuery("");
								setSelectedTags([]);
							}}
						>
							Clear Filters
						</Button>
					</aside>

					<main className="flex-grow">
						<div className="bg-primary-foreground p-6 rounded-lg shadow-md mb-8">
							<div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
								<div className="flex-grow">
									<div className="relative">
										<Input
											id="search"
											type="search"
											placeholder="Search games..."
											className="w-full pl-10"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
									</div>
								</div>
								<div className="w-full md:w-48">
									<Select
										value={sortBy}
										onValueChange={(value) => setSortBy(value)}
									>
										<SelectTrigger id="sort" className="w-full">
											<SelectValue placeholder="Sort by" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="comments-desc">
												Most Comments
											</SelectItem>
											<SelectItem value="comments-asc">
												Least Comments
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						{currentGames.length > 0 ? (
							<>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
									{currentGames.map((game, index) => (
										<Card key={index} className="flex flex-col">
											<CardHeader>
												<img
													src={game.image}
													alt={game.title}
													width={300}
													height={200}
													className="w-full h-48 object-cover rounded-t-lg"
													onError={({ currentTarget }) => {
														currentTarget.onerror = null;
														currentTarget.src = "./not-found.svg";
														currentTarget.className =
															"w-full h-48 object-center rounded-t-lg";
													}}
												/>
											</CardHeader>
											<CardContent className="flex-grow">
												<CardTitle className="text-lg">{game.title}</CardTitle>
												<div className="flex flex-wrap gap-2 mt-4">
													{game.genres.split(", ").map((genre) => (
														<span
															key={genre}
															className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded"
														>
															{genre}
														</span>
													))}
												</div>
											</CardContent>
											<CardFooter className="flex justify-between items-center">
												<div className="flex items-center">
													<MessageSquare className="w-4 h-4 mr-2" />
													<span className="text-md">
														{game.comments
															.toString()
															.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
													</span>
												</div>
												<Button asChild>
													<a href={game.link} target="_blank">
														View Repack
													</a>
												</Button>
											</CardFooter>
										</Card>
									))}
								</div>

								<div className="flex justify-center flex-wrap items-center space-x-2 mb-8">
									<Button
										variant="outline"
										size="icon"
										onClick={() => {
											paginate(currentPage - 1);
										}}
										disabled={currentPage === 1}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									{getPageNumbers().map((pageNumber, index) =>
										pageNumber === "..." ? (
											<span key={index} className="px-2">
												...
											</span>
										) : (
											<Button
												key={index}
												variant={
													currentPage === pageNumber ? "default" : "outline"
												}
												onClick={() =>
													typeof pageNumber === "number" && paginate(pageNumber)
												}
											>
												{pageNumber}
											</Button>
										)
									)}
									<Button
										variant="outline"
										size="icon"
										onClick={() => {
											paginate(currentPage + 1);
										}}
										disabled={currentPage === totalPages}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
									<form
										onSubmit={handlePageInputSubmit}
										className="flex items-center space-x-2 pt-2 sm:pt-0"
									>
										<Input
											min={1}
											max={totalPages}
											value={pageInputValue}
											onChange={(e) => setPageInputValue(e.target.value)}
											placeholder="Page #"
											className="w-20"
										/>
										<Button type="submit">Go</Button>
									</form>
								</div>
							</>
						) : (
							<div className="h-full flex justify-center items-center">
								<h2 className="">NO GAMES FOUND ☹️</h2>
							</div>
						)}
					</main>
				</div>
			</div>
		</ThemeProvider>
	);
}
