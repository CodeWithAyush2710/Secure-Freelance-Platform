import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function WorkSureApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto shadow-xl rounded-3xl bg-white p-10 border border-gray-300">
        <h1 className="text-5xl font-extrabold text-center text-indigo-600 mb-4 tracking-tight">WorkSure</h1>
        <p className="text-center text-gray-500 text-lg mb-10">
          A secure freelance platform where contracts and payments are transparent and enforced.
        </p>

        <Tabs defaultValue="freelancer" className="mb-6">
          <TabsList className="flex justify-center space-x-4 bg-indigo-100 p-2 rounded-full">
            <TabsTrigger value="freelancer" className="px-6 py-2 rounded-full text-indigo-600 font-medium hover:bg-indigo-200">Freelancer Dashboard</TabsTrigger>
            <TabsTrigger value="client" className="px-6 py-2 rounded-full text-indigo-600 font-medium hover:bg-indigo-200">Client Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="freelancer">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="shadow-md rounded-2xl border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Active Contracts</h2>
                  <p className="text-gray-600 mb-4">You have 2 active contracts.</p>
                  <Button className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700">View Contracts</Button>
                </CardContent>
              </Card>

              <Card className="shadow-md rounded-2xl border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-indigo-700">New Proposal</h2>
                  <Input placeholder="Enter project title" className="mb-3 border-gray-300 focus:ring-indigo-500" />
                  <Input placeholder="Describe your services" className="mb-3 border-gray-300 focus:ring-indigo-500" />
                  <Button className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700">Create Proposal</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="client">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="shadow-md rounded-2xl border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Contracts Awaiting Approval</h2>
                  <p className="text-gray-600 mb-4">1 contract needs your approval.</p>
                  <Button className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700">Review Contracts</Button>
                </CardContent>
              </Card>

              <Card className="shadow-md rounded-2xl border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Create New Contract</h2>
                  <Input placeholder="Freelancer username" className="mb-3 border-gray-300 focus:ring-indigo-500" />
                  <Input placeholder="Project description" className="mb-3 border-gray-300 focus:ring-indigo-500" />
                  <Input placeholder="Milestone details" className="mb-3 border-gray-300 focus:ring-indigo-500" />
                  <Button className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700">Create Contract</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}