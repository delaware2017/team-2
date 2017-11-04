from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^todos/$', views.todo_list.as_view(), name='todo_list'),
    url(r'^todo/create/$', views.todo_create.as_view(), name='todo_create')
]
