require 'caravaggio/canvas'

module Caravaggio
  class CanvasController < Caravaggio::ApplicationController
    protect_from_forgery with: :exception
    
    def index
      @canvas = Canvas.new.to_json
    end
  end
end
