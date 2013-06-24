/*******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 ******************************************************************************/

describe("File API", function () {
  var TIMEOUT = 15000

  var service1, service2
  function findServices() {
    runs(function () {
      webinos.discovery.findServices(
          new ServiceType("http://webinos.org/api/file"), {
            onFound : function (ref) {
              if (ref.description.substr(0, 5) === "test1") {
                service1 = ref
              } else if (ref.description.substr(0, 5) === "test2") {
                service2 = ref
              }
            }
          })
    })

    waitsFor(function () {
      return !!service1 && !!service2
    }, "the services to be discovered", TIMEOUT)
  }

  function bindServices() {
    var bound = 0
    runs(function () {
      service1.bindService({
        onBind : function () {
          bound++
        }
      })

      service2.bindService({
        onBind : function () {
          bound++
        }
      })
    })

    waitsFor(function () {
      return bound == 2
    }, "the services to be bound", TIMEOUT)
  }

  function clearServices() {
    service1 = null; service2 = null
  }

  describe("services", function () {
    it("should be discoverable", function () {
      findServices()
      clearServices()
    })

    it("should be bindable", function () {
      findServices()
      bindServices()
      clearServices()
    })
  })

  var fileSystem1, fileSystem2
  function requestFileSystems() {
    runs(function () {
      service1.requestFileSystem(null, null, function (ref) {
        fileSystem1 = ref
      })

      service2.requestFileSystem(null, null, function (ref) {
        fileSystem2 = ref
      })
    })

    waitsFor(function () {
      return !!fileSystem1 && !!fileSystem2
    }, "the file systems to be returned", TIMEOUT)
  }

  function clearFileSystems() {
    fileSystem1 = null; fileSystem2 = null
  }

  describe("file systems", function () {
    beforeEach(findServices)
    beforeEach(bindServices)
    afterEach(clearServices)

    it("should be requestable", function () {
      requestFileSystems()
      clearFileSystems()
    })

    xit("should be the same on (identical) subsequent requests", function () {})
  })

  var directory
  function createDirectory(fileSystem, name, options) {
    var relativeName = name || "directory"
      , relativeOptions = options || { create : true }

    runs(function () {
      fileSystem.root.getDirectory(relativeName, relativeOptions, function (ref) {
        directory = ref
      })
    })

    waitsFor(function () {
      return !!directory
    }, "the directory to be created", TIMEOUT)
  }

  function removeDirectory() {
    runs(function () {
      directory.remove(function () {
        directory = null
      })
    })

    waitsFor(function () {
      return !(!!directory)
    }, "the directory to be removed", TIMEOUT)
  }

  describe("directory entry", function () {
    beforeEach(findServices)
    beforeEach(bindServices)
    beforeEach(requestFileSystems)
    afterEach(clearFileSystems)
    afterEach(clearServices)

    it("should be creatable and removable", function () {
      createDirectory(fileSystem1)
      removeDirectory()
    })

    xit("should not be recreatable in exlcusive mode", function () {})

    it("should be getable", function () {
      createDirectory(fileSystem1, "directory")

      var clone
      runs(function () {
        fileSystem1.root.getDirectory("directory", null, function (ref) {
          clone = ref
        })
      })

      waitsFor(function () {
        return !!clone
      }, "the directory to be returned", TIMEOUT)

      runs(function () {
        expect(clone.fullPath).toEqual(directory.fullPath)
      })

      removeDirectory()
    })

    it("should provide metadata", function () {
      createDirectory(fileSystem1)

      var metadata
      runs(function () {
        directory.getMetadata(function (ref) {
          metadata = ref
        })
      })

      waitsFor(function () {
        return !!metadata
      }, "the metadata to be returned", TIMEOUT)

      runs(function () {
        expect(metadata.modificationTime).toBeDefined()
        // expect(metadata.size).toBeDefined()
      })

      removeDirectory()
    })

    it("should be movable", function () {
      createDirectory(fileSystem1)

      var moved = false
      runs(function () {
        directory.moveTo(fileSystem1.root, "moved", function (ref) {
          moved = true
          directory = ref
        })
      })

      waitsFor(function () {
        return moved
      }, "the directory to be moved", TIMEOUT)

      removeDirectory()
    })

    it("should be movable (remote)", function () {
      createDirectory(fileSystem1)

      var moved = false
      runs(function () {
        directory.moveTo(fileSystem2.root, "moved", function (ref) {
          moved = true
          directory = ref
        })
      })

      waitsFor(function () {
        return moved
      }, "the directory to be moved", TIMEOUT)

      removeDirectory()
    })

    it("should be copyable", function () {
      createDirectory(fileSystem1)

      var copy
      runs(function () {
        directory.copyTo(fileSystem1.root, "copied", function (ref) {
          copy = ref
        })
      })

      waitsFor(function () {
        return !!copy
      }, "the directory to be copied", TIMEOUT)

      runs(function () {
        copy.remove(function () {
          copy = null
        })
      })

      waitsFor(function () {
        return !(!!copy)
      }, "the copy to be removed", TIMEOUT)

      removeDirectory()
    })

    it("should be copyable (remote)", function () {
      createDirectory(fileSystem1)

      var copy
      runs(function () {
        directory.copyTo(fileSystem2.root, "copied", function (ref) {
          copy = ref
        })
      })

      waitsFor(function () {
        return !!copy
      }, "the directory to be copied", TIMEOUT)

      runs(function () {
        copy.remove(function () {
          copy = null
        })
      })

      waitsFor(function () {
        return !(!!copy)
      }, "the copy to be removed", TIMEOUT)

      removeDirectory()
    })

    xit("should provide a (unique) URL", function () {})

    it("should provide access to its parent", function () {
      createDirectory(fileSystem1)

      var parent
      runs(function () {
        directory.getParent(function (ref) {
          parent = ref
        })
      })

      waitsFor(function () {
        return !!parent
      }, "the directory's parent to be returned", TIMEOUT)

      runs(function() {
        expect(parent.fullPath).toEqual(fileSystem1.root.fullPath)
      })

      removeDirectory()
    })

    it("should be recursively removable", function () {
      createDirectory(fileSystem1)

      var created = false
      runs(function () {
        directory.getDirectory("test", { create : true }, function (ref) {
          created = true
        })
      })

      waitsFor(function () {
        return created
      }, "the directory's child to be created", TIMEOUT)

      runs(function () {
        directory.removeRecursively(function () {
          directory = null
        })
      })

      waitsFor(function () {
        return !(!!directory)
      }, "the directory to be removed recursively", TIMEOUT)
    })
  })

  describe("directory reader", function () {
    beforeEach(findServices)
    beforeEach(bindServices)
    beforeEach(requestFileSystems)
    beforeEach(function() { createDirectory(fileSystem1) })
    afterEach(removeDirectory)
    afterEach(clearFileSystems)
    afterEach(clearServices)

    it("should provide access to a directory's entries", function () {
      var entries = []
      runs(function () {
        var reader = fileSystem1.root.createReader()
        reader.readEntries(function (ref) {
          entries = ref
        })
      })

      waitsFor(function () {
        return entries.length
      }, "the directory's entries to be returned")

      runs(function () {
        expect(entries[0].fullPath).toEqual(directory.fullPath)
      })
    })
  })

  var file
  function createFile(fileSystem, name, options) {
    var relativeName = name || "file"
      , relativeOptions = options || { create : true }

    runs(function () {
      fileSystem.root.getFile(relativeName, relativeOptions, function (ref) {
        file = ref
      })
    })

    waitsFor(function () {
      return !!file
    }, "the file to be created", TIMEOUT)
  }

  function removeFile() {
    runs(function () {
      file.remove(function () {
        file = null
      })
    })

    waitsFor(function () {
      return !(!!file)
    }, "the file to be removed", TIMEOUT)
  }

  describe("file entry", function () {
    beforeEach(findServices)
    beforeEach(bindServices)
    beforeEach(requestFileSystems)
    afterEach(clearFileSystems)
    afterEach(clearServices)

    it("should be creatable and removable", function () {
      createFile(fileSystem1)
      removeFile()
    })

    xit("should not be recreatable in exlcusive mode", function () {})

    it("should be getable", function () {
      createFile(fileSystem1, "file")

      var clone
      runs(function () {
        fileSystem1.root.getFile("file", null, function (ref) {
          clone = ref
        })
      })

      waitsFor(function () {
        return !!clone
      }, "the file to be returned", TIMEOUT)

      runs(function () {
        expect(clone.fullPath).toEqual(file.fullPath)
      })

      removeFile()
    })

    it("should provide metadata", function () {
      createFile(fileSystem1)

      var metadata
      runs(function () {
        file.getMetadata(function (ref) {
          metadata = ref
        })
      })

      waitsFor(function () {
        return !!metadata
      }, "the metadata to be returned", TIMEOUT)

      runs(function () {
        expect(metadata.modificationTime).toBeDefined()
        // expect(metadata.size).toBeDefined()
      })

      removeFile()
    })

    it("should provide a link", function () {
      createFile(fileSystem1)

      var link
      runs(function () {
        file.getLink(function (link_) {
          link = link_
        })
      })

      waitsFor(function () {
        return !!link
      }, "the link to be returned", TIMEOUT)

      removeFile()
    })

    it("should be movable", function () {
      createFile(fileSystem1)

      var moved = false
      runs(function () {
        file.moveTo(fileSystem1.root, "moved", function (ref) {
          moved = true
          file = ref
        })
      })

      waitsFor(function () {
        return moved
      }, "the file to be moved", TIMEOUT)

      removeFile()
    })

    it("should be movable (remote)", function () {
      createFile(fileSystem1)

      var moved = false
      runs(function () {
        file.moveTo(fileSystem2.root, "moved", function (ref) {
          moved = true
          file = ref
        })
      })

      waitsFor(function () {
        return moved
      }, "the file to be moved", TIMEOUT)

      removeFile()
    })

    it("should be copyable", function () {
      createFile(fileSystem1)

      var copy
      runs(function () {
        file.copyTo(fileSystem1.root, "copied", function (ref) {
          copy = ref
        })
      })

      waitsFor(function () {
        return !!copy
      }, "the file to be copied", TIMEOUT)

      runs(function () {
        copy.remove(function () {
          copy = null
        })
      })

      waitsFor(function () {
        return !(!!copy)
      }, "the copy to be removed", TIMEOUT)

      removeFile()
    })

    it("should be copyable (remote)", function () {
      createFile(fileSystem1)

      var copy
      runs(function () {
        file.copyTo(fileSystem2.root, "copied", function (ref) {
          copy = ref
        })
      })

      waitsFor(function () {
        return !!copy
      }, "the file to be copied", TIMEOUT)

      runs(function () {
        copy.remove(function () {
          copy = null
        })
      })

      waitsFor(function () {
        return !(!!copy)
      }, "the copy to be removed", TIMEOUT)

      removeFile()
    })

    xit("should provide a (unique) URL", function () {})

    it("should provide access to its parent", function () {
      createFile(fileSystem1)

      var parent
      runs(function () {
        file.getParent(function (ref) {
          parent = ref
        })
      })

      waitsFor(function () {
        return !!parent
      }, "the file's parent to be returned", TIMEOUT)

      runs(function() {
        expect(parent.fullPath).toEqual(fileSystem1.root.fullPath)
      })

      removeFile()
    })
  })

  describe("file writer", function () {
    beforeEach(findServices)
    beforeEach(bindServices)
    beforeEach(requestFileSystems)
    beforeEach(function () { createFile(fileSystem1) })
    afterEach(removeFile)
    afterEach(clearFileSystems)
    afterEach(clearServices)

    it("should be able to write to a file", function () {
      var writer
      var start = false, progress = false, write = false, end = false
      runs(function () {
        file.createWriter(function (ref) {
          writer = ref

          // expect(writer.length).toBe(0)
          // expect(writer.position).toBe(0)

          writer.onwritestart = function () {
            expect(start).toBe(false)
            expect(progress).toBe(false)
            expect(write).toBe(false)
            expect(end).toBe(false)

            start = true
          }

          writer.onprogress = function () {
            expect(start).toBe(true)
            expect(write).toBe(false)
            expect(end).toBe(false)

            progress = true
          }

          writer.onwrite = function () {
            expect(start).toBe(true)
            expect(progress).toBe(true)
            expect(write).toBe(false)
            expect(end).toBe(false)

            write = true
          }

          writer.onwriteend = function () {
            expect(start).toBe(true)
            expect(progress).toBe(true)
            expect(write).toBe(true)
            expect(end).toBe(false)

            end = true
          }

          writer.write(new Blob(["string"]))
        })
      })

      waitsFor(function () {
        return start && progress && write && end
      }, "the data to be written", 5 * TIMEOUT)

      runs(function () {
        expect(writer.length).toBe(6)
        expect(writer.position).toBe(6)
      })
    })

    it("should be able to write to a file at a specific position", function () {
      var writer
      var start = false, progress = false, write = false, end = false
      runs(function () {
        file.createWriter(function (ref) {
          writer = ref

          // expect(writer.length).toBe(0)
          // expect(writer.position).toBe(0)

          writer.onwritestart = function () {
            expect(start).toBe(false)
            expect(progress).toBe(false)
            expect(write).toBe(false)
            expect(end).toBe(false)

            start = true
          }

          writer.onprogress = function () {
            expect(start).toBe(true)
            expect(write).toBe(false)
            expect(end).toBe(false)

            progress = true
          }

          writer.onwrite = function () {
            expect(start).toBe(true)
            expect(progress).toBe(true)
            expect(write).toBe(false)
            expect(end).toBe(false)

            write = true
          }

          writer.onwriteend = function () {
            expect(start).toBe(true)
            expect(progress).toBe(true)
            expect(write).toBe(true)
            expect(end).toBe(false)

            end = true
          }

          writer.write(new Blob(["strr"]))
        })
      })

      waitsFor(function () {
        return start && progress && write && end
      }, "the first data to be written", 5 * TIMEOUT)

      runs(function () {
        expect(writer.length).toBe(4)
        expect(writer.position).toBe(4)

        writer.seek(3)

        expect(writer.length).toBe(4)
        expect(writer.position).toBe(3)

        start = false, progress = false, write = false, end = false

        writer.write(new Blob(["ing"]))
      })

      waitsFor(function () {
        return start && progress && write && end
      }, "the second data to be written", 5 * TIMEOUT)

      runs(function () {
        expect(writer.length).toBe(6)
        expect(writer.position).toBe(6)
      })
    })

    it("should be able to truncate a file", function () {
      var writer
      var start = false, progress = false, write = false, end = false
      runs(function () {
        file.createWriter(function (ref) {
          writer = ref

          // expect(writer.length).toBe(0)
          // expect(writer.position).toBe(0)

          writer.onwritestart = function () {
            expect(start).toBe(false)
            expect(progress).toBe(false)
            expect(write).toBe(false)
            expect(end).toBe(false)

            start = true
          }

          writer.onprogress = function () {
            expect(start).toBe(true)
            expect(write).toBe(false)
            expect(end).toBe(false)

            progress = true
          }

          writer.onwrite = function () {
            expect(start).toBe(true)
            expect(progress).toBe(true)
            expect(write).toBe(false)
            expect(end).toBe(false)

            write = true
          }

          writer.onwriteend = function () {
            expect(start).toBe(true)
            expect(progress).toBe(true)
            expect(write).toBe(true)
            expect(end).toBe(false)

            end = true
          }

          writer.write(new Blob(["string"]))
        })
      })

      waitsFor(function () {
        return start && progress && write && end
      }, "the data to be written", 5 * TIMEOUT)

      runs(function () {
        expect(writer.length).toBe(6)
        expect(writer.position).toBe(6)

        start = false, progress = false, write = false, end = false

        writer.onwritestart = function () {
          expect(start).toBe(false)
          expect(progress).toBe(false)
          expect(write).toBe(false)
          expect(end).toBe(false)

          start = true
        }

        writer.onprogress = function () {
          expect(start).toBe(true)
          expect(write).toBe(false)
          expect(end).toBe(false)

          progress = true
        }

        writer.onwrite = function () {
          expect(start).toBe(true)
          expect(progress).toBe(false)
          expect(write).toBe(false)
          expect(end).toBe(false)

          write = true
        }

        writer.onwriteend = function () {
          expect(start).toBe(true)
          expect(progress).toBe(false)
          expect(write).toBe(true)
          expect(end).toBe(false)

          end = true
        }

        writer.truncate(3)
      })

      waitsFor(function () {
        return start && !progress && write && end
      }, "the file to be truncated", 5 * TIMEOUT)

      runs(function () {
        expect(writer.length).toBe(3)
        expect(writer.position).toBe(3)
      })
    })
  })

  xdescribe("file reader", function () {
    beforeEach(findServices)
    beforeEach(bindServices)
    beforeEach(requestFileSystems)
    beforeEach(function () { createFile(fileSystem1) })
    afterEach(removeFile)
    afterEach(clearFileSystems)
    afterEach(clearServices)

    xit("should be able to read a file as ArrayBuffer", function () {})

    it("should be able to read a file as text", function () {
      var writer
        , builder = new webinos.file.BlobBuilder()
      var start = false, progress = false, write = false, end = false
      runs(function () {
        file.createWriter(function (ref) {
          writer = ref

          // expect(writer.length).toBe(0)
          // expect(writer.position).toBe(0)

          writer.onwritestart = function () {
            expect(start).toBe(false)
            expect(progress).toBe(false)
            expect(write).toBe(false)
            expect(end).toBe(false)

            start = true
          }

          writer.onprogress = function () {
            expect(start).toBe(true)
            expect(write).toBe(false)
            expect(end).toBe(false)

            progress = true
          }

          writer.onwrite = function () {
            expect(start).toBe(true)
            expect(progress).toBe(true)
            expect(write).toBe(false)
            expect(end).toBe(false)

            write = true
          }

          writer.onwriteend = function () {
            expect(start).toBe(true)
            expect(progress).toBe(true)
            expect(write).toBe(true)
            expect(end).toBe(false)

            end = true
          }

          builder.append("string")

          writer.write(builder.getBlob())
        })
      })

      waitsFor(function () {
        return start && progress && write && end
      }, "the data to be written", 5 * TIMEOUT)

      var blob
      runs(function () {
        expect(writer.length).toBe(6)
        expect(writer.position).toBe(6)

        file.file(function (ref) {
          blob = ref
        })
      })

      waitsFor(function () {
        return !!blob
      }, "the file's blob to be returned", TIMEOUT)

      var reader
      runs(function () {
        start = false, progress = false, write = false, end = false

        reader = new webinos.file.FileReader(blob._entry.filesystem)
        reader.onloadstart = function () {
          expect(start).toBe(false)
          expect(progress).toBe(false)
          expect(write).toBe(false)
          expect(end).toBe(false)

          start = true
        }

        reader.onprogress = function () {
          expect(start).toBe(true)
          expect(write).toBe(false)
          expect(end).toBe(false)

          progress = true
        }

        reader.onload = function () {
          expect(start).toBe(true)
          expect(progress).toBe(true)
          expect(write).toBe(false)
          expect(end).toBe(false)

          write = true
        }

        reader.onloadend = function () {
          expect(start).toBe(true)
          expect(progress).toBe(true)
          expect(write).toBe(true)
          expect(end).toBe(false)

          end = true
        }

        reader.readAsText(blob)
      })

      waitsFor(function () {
        return start && progress && write && end
      }, "the data to be read", 5 * TIMEOUT)

      runs(function () {
        expect(reader.result).toBe("string")
      })
    })

    xit("should be able to read a file as data URL", function () {})
  })

  xdescribe("blob", function () {})
})
