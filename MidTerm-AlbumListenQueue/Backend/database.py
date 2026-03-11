# keep files here to have write acesses
from typing import List
from Backend.model import Album,ListenedAlbum

album_list: List[Album] = [
    Album(id=1, title="Amnesiac",artist="Radiohead",year=2001,listen_format="Digital", priority=True)

]

listened_album_list: List[ListenedAlbum] = [
    ListenedAlbum(id=1, title="Dreams", artist="Elephant Gym", year=2022,listen_format="CD", rating=7.8)
]