module Sass
  module Importers
    class JSBin < Base
      def find(name, options)
        # if name == 'xyz/1.scss'
        m = name.match /([^\/\s]+)\/(\d+).(scss|sass)/
        if m
          # options[:syntax] = :scss
          # options[:filename] = 'globals'
          # options[:importer] = self
          # return Sass::Engine.new("$foo: aaa; $bar: bbb;", options)
          f = Sass::Engine.new("@import '" + m[1] + "." + m[2] + "." + m[3] + "'", options)
          return f
        else
          return nil
        end
      end

      # def find_relative(uri, base, options)
      #     nil
      # end

      def key(uri, options)
          [self.class.name, uri]
      end

      # def mtime(uri, options)
      #     nil
      # end

      def to_s
          '[custom]'
      end
    end
  end
end